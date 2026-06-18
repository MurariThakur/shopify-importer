<?php

namespace App\Jobs;

use App\Exceptions\ShopifyRateLimitException;
use App\Models\ProductImport;
use App\Models\Upload;
use App\Services\ShopifyService;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ProcessShopifyProduct implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 60;
    public array $backoff = [30, 60, 120];

    public function __construct(
        private ProductImport $productImport
    ) {}

    public function handle(ShopifyService $shopify): void
    {
        $this->productImport->update(['status' => 'processing']);

        $row = $this->productImport->raw_data;
        $handle = $row['Handle'];

        try {
            $existing = $shopify->findProductByHandle($handle);

            if ($existing === null) {
                $productInput = [
                    'title'           => $row['Title'],
                    'handle'          => $handle,
                    'descriptionHtml' => $row['Body HTML'] ?? '',
                    'vendor'          => $row['Vendor'] ?? '',
                    'productType'     => $row['Product Type'] ?? '',
                    'tags'            => !empty($row['Tags']) ? array_map('trim', explode(',', $row['Tags'])) : [],
                    'status'          => filter_var($row['Published'] ?? 'false', FILTER_VALIDATE_BOOLEAN)
                        ? 'ACTIVE' : 'DRAFT',
                ];

                $media = [];
                if (!empty($row['Image Src']) && filter_var($row['Image Src'], FILTER_VALIDATE_URL)) {
                    $media[] = [
                        'originalSource'   => $row['Image Src'],
                        'alt'              => $row['Image Alt Text'] ?? '',
                        'mediaContentType' => 'IMAGE',
                    ];
                }

                $result = $shopify->createProduct($productInput, $media);
                $shopify->updateVariant($result['productId'], $result['variantId'], $row);

                Log::channel('db')->info('Product created in Shopify', [
                    'upload_id'         => $this->productImport->upload_id,
                    'product_import_id' => $this->productImport->id,
                    'context'           => ['product_id' => $result['productId'], 'handle' => $handle],
                ]);
            } else {
                $existingProductGid = $existing['id'];
                $existingVariantGid = $existing['variants']['edges'][0]['node']['id'];

                $result = $shopify->updateProduct($existingProductGid, $existingVariantGid, $row);

                Log::channel('db')->info('Product updated (upsert)', [
                    'upload_id'         => $this->productImport->upload_id,
                    'product_import_id' => $this->productImport->id,
                    'context'           => ['product_id' => $result['productId'], 'handle' => $handle],
                ]);
            }

            $shopify->addProductToCollection($result['productId']);

            $this->productImport->update([
                'status'             => 'successful',
                'shopify_product_id' => $result['productId'],
                'shopify_variant_id' => $result['variantId'],
            ]);

            Log::channel('db')->info('Product added to collection', [
                'upload_id'         => $this->productImport->upload_id,
                'product_import_id' => $this->productImport->id,
                'context'           => ['collection_id' => config('shopify.collection_id')],
            ]);

        } catch (ShopifyRateLimitException $e) {
            Log::channel('db')->warning('Rate limit hit, releasing job', [
                'upload_id'         => $this->productImport->upload_id,
                'product_import_id' => $this->productImport->id,
                'context'           => ['retry_after' => $e->getRetryAfter()],
            ]);

            $this->productImport->update(['status' => 'pending']);
            $this->release($e->getRetryAfter());
            return;

        } catch (\Throwable $e) {
            $this->productImport->update([
                'status'        => 'failed',
                'error_message' => $e->getMessage(),
            ]);

            Log::channel('db')->error('Product import failed', [
                'upload_id'         => $this->productImport->upload_id,
                'product_import_id' => $this->productImport->id,
                'context'           => ['error' => $e->getMessage(), 'handle' => $handle],
            ]);

            throw $e;
        }

        $this->checkUploadComplete();
    }

    public function failed(\Throwable $e): void
    {
        $this->productImport->update([
            'status'        => 'failed',
            'error_message' => $e->getMessage(),
        ]);

        Log::channel('db')->error('Product import job permanently failed', [
            'upload_id'         => $this->productImport->upload_id,
            'product_import_id' => $this->productImport->id,
            'context'           => ['error' => $e->getMessage()],
        ]);

        $this->checkUploadComplete();
    }

    private function checkUploadComplete(): void
    {
        $upload = Upload::find($this->productImport->upload_id);

        if (!$upload) {
            return;
        }

        $allDone = !$upload->productImports()
            ->whereIn('status', ['pending', 'processing'])
            ->exists();

        if ($allDone) {
            $upload->update([
                'status'       => 'completed',
                'processed_at' => now(),
            ]);

            Log::channel('db')->info('Upload processing completed', [
                'upload_id' => $upload->id,
            ]);
        }
    }
}
