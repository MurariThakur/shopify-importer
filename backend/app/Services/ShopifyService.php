<?php

namespace App\Services;

use App\Exceptions\ShopifyApiException;
use App\Exceptions\ShopifyRateLimitException;
use Illuminate\Support\Facades\Http;

class ShopifyService
{
    private function graphql(string $query, array $variables = []): array
    {
        $response = Http::withHeaders([
            'X-Shopify-Access-Token' => config('shopify.access_token'),
            'Content-Type'           => 'application/json',
        ])->post(config('shopify.graphql_endpoint'), [
            'query'     => $query,
            'variables' => $variables,
        ]);

        if ($response->status() === 429) {
            $retryAfter = (int) $response->header('Retry-After', 10);
            throw new ShopifyRateLimitException("Rate limited. Retry after {$retryAfter}s", $retryAfter);
        }

        if ($response->failed()) {
            throw new ShopifyApiException("HTTP {$response->status()}: {$response->body()}");
        }

        $data = $response->json();

        if (!empty($data['errors'])) {
            $msg = collect($data['errors'])->pluck('message')->implode('; ');
            throw new ShopifyApiException("GraphQL errors: {$msg}");
        }

        return $data['data'];
    }

    public function findProductByHandle(string $handle): ?array
    {
        $query = <<<'GQL'
        query GetProductByHandle($handle: String!) {
            productByHandle(handle: $handle) {
                id
                title
                handle
                variants(first: 1) {
                    edges {
                        node {
                            id
                            sku
                            price
                        }
                    }
                }
            }
        }
        GQL;

        $data = $this->graphql($query, ['handle' => $handle]);

        return $data['productByHandle'] ?? null;
    }

    public function createProduct(array $productInput, array $media = []): array
    {
        $query = <<<'GQL'
        mutation CreateProduct($input: ProductInput!, $media: [CreateMediaInput!]) {
            productCreate(input: $input, media: $media) {
                product {
                    id
                    handle
                    title
                    variants(first: 1) {
                        edges {
                            node {
                                id
                            }
                        }
                    }
                }
                userErrors {
                    field
                    message
                }
            }
        }
        GQL;

        $variables = ['input' => $productInput];
        if (!empty($media)) {
            $variables['media'] = $media;
        }

        $data = $this->graphql($query, $variables);
        $result = $data['productCreate'];

        if (!empty($result['userErrors'])) {
            $msg = collect($result['userErrors'])->map(fn($e) => "{$e['field']}: {$e['message']}")->implode('; ');
            throw new ShopifyApiException("Product create userErrors: {$msg}");
        }

        $productGid = $result['product']['id'];
        $variantGid = $result['product']['variants']['edges'][0]['node']['id'] ?? null;

        return [
            'productId' => $productGid,
            'variantId' => $variantGid,
        ];
    }

    public function updateVariant(string $productGid, string $variantGid, array $row): void
    {
        $query = <<<'GQL'
        mutation UpdateVariant($productId: ID!, $variants: [ProductVariantsBulkInput!]!) {
            productVariantsBulkUpdate(productId: $productId, variants: $variants) {
                productVariants {
                    id
                    price
                }
                userErrors {
                    field
                    message
                }
            }
        }
        GQL;

        $inventoryItem = [
            'requiresShipping' => filter_var($row['Variant Requires Shipping'] ?? 'true', FILTER_VALIDATE_BOOLEAN),
        ];

        if (!empty($row['Variant SKU'])) {
            $inventoryItem['sku'] = $row['Variant SKU'];
        }

        if (!empty($row['Variant Weight'])) {
            $inventoryItem['measurement'] = [
                'weight' => [
                    'value' => (float) $row['Variant Weight'],
                    'unit'  => $this->normalizeWeightUnit($row['Variant Weight Unit'] ?? ''),
                ],
            ];
        }

        $variantInput = [
            'id'              => $variantGid,
            'price'           => (string) $row['Variant Price'],
            'taxable'         => filter_var($row['Variant Taxable'] ?? 'true', FILTER_VALIDATE_BOOLEAN),
            'inventoryPolicy' => strtoupper($row['Variant Inventory Policy'] ?? 'DENY'),
            'inventoryItem'   => $inventoryItem,
        ];

        if (!empty($row['Variant Compare At Price'])) {
            $variantInput['compareAtPrice'] = (string) $row['Variant Compare At Price'];
        }

        $variables = [
            'productId' => $productGid,
            'variants'  => [$variantInput],
        ];

        $data = $this->graphql($query, $variables);
        $result = $data['productVariantsBulkUpdate'];

        if (!empty($result['userErrors'])) {
            $msg = collect($result['userErrors'])->map(fn($e) => "{$e['field']}: {$e['message']}")->implode('; ');
            throw new ShopifyApiException("Variant update userErrors: {$msg}");
        }
    }

    public function updateProduct(string $productGid, string $variantGid, array $row): array
    {
        $query = <<<'GQL'
        mutation UpdateProduct($input: ProductInput!) {
            productUpdate(input: $input) {
                product {
                    id
                    handle
                    title
                }
                userErrors {
                    field
                    message
                }
            }
        }
        GQL;

        $input = [
            'id'              => $productGid,
            'title'           => $row['Title'] ?? '',
            'descriptionHtml' => $row['Body HTML'] ?? '',
            'vendor'          => $row['Vendor'] ?? '',
            'productType'     => $row['Product Type'] ?? '',
            'tags'            => !empty($row['Tags']) ? array_map('trim', explode(',', $row['Tags'])) : [],
            'status'          => filter_var($row['Published'] ?? 'false', FILTER_VALIDATE_BOOLEAN)
                ? 'ACTIVE' : 'DRAFT',
        ];

        $data = $this->graphql($query, ['input' => $input]);
        $result = $data['productUpdate'];

        if (!empty($result['userErrors'])) {
            $msg = collect($result['userErrors'])->map(fn($e) => "{$e['field']}: {$e['message']}")->implode('; ');
            throw new ShopifyApiException("Product update userErrors: {$msg}");
        }

        $this->updateVariant($productGid, $variantGid, $row);

        return [
            'productId' => $productGid,
            'variantId' => $variantGid,
        ];
    }

    public function addProductToCollection(string $productGid): void
    {
        $query = <<<'GQL'
        mutation AddToCollection($id: ID!, $productIds: [ID!]!) {
            collectionAddProducts(id: $id, productIds: $productIds) {
                collection {
                    id
                    title
                }
                userErrors {
                    field
                    message
                }
            }
        }
        GQL;

        $variables = [
            'id'         => 'gid://shopify/Collection/' . config('shopify.collection_id'),
            'productIds' => [$productGid],
        ];

        $data = $this->graphql($query, $variables);
        $result = $data['collectionAddProducts'];

        if (!empty($result['userErrors'])) {
            $msg = collect($result['userErrors'])->map(fn($e) => "{$e['field']}: {$e['message']}")->implode('; ');
            throw new ShopifyApiException("Collection add userErrors: {$msg}");
        }
    }

    private function normalizeWeightUnit(string $unit): string
    {
        $unit = strtoupper(trim($unit));

        $map = [
            'KG'         => 'KILOGRAMS',
            'KGS'        => 'KILOGRAMS',
            'KILOGRAM'   => 'KILOGRAMS',
            'KILOGRAMS'  => 'KILOGRAMS',
            'G'          => 'GRAMS',
            'GR'         => 'GRAMS',
            'GRAM'       => 'GRAMS',
            'GRAMS'      => 'GRAMS',
            'LB'         => 'POUNDS',
            'LBS'        => 'POUNDS',
            'POUND'      => 'POUNDS',
            'POUNDS'     => 'POUNDS',
            'OZ'         => 'OUNCES',
            'OUNCE'      => 'OUNCES',
            'OUNCES'     => 'OUNCES',
        ];

        return $map[$unit] ?? 'KILOGRAMS';
    }
}
