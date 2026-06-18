<?php

return [
    'store_url'        => env('SHOPIFY_STORE_URL'),
    'access_token'     => env('SHOPIFY_ACCESS_TOKEN'),
    'api_version'      => env('SHOPIFY_API_VERSION', '2024-10'),
    'collection_id'    => env('SHOPIFY_COLLECTION_ID'),
    'graphql_endpoint' => env('SHOPIFY_GRAPHQL_ENDPOINT'),
];
