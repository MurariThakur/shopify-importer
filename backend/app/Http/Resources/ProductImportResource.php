<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductImportResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                 => $this->id,
            'upload_id'          => $this->upload_id,
            'row_number'         => $this->row_number,
            'handle'             => $this->handle,
            'title'              => $this->title,
            'shopify_product_id' => $this->shopify_product_id,
            'shopify_variant_id' => $this->shopify_variant_id,
            'status'             => $this->status,
            'error_message'      => $this->error_message,
            'raw_data'           => $this->raw_data,
            'created_at'         => $this->created_at,
            'updated_at'         => $this->updated_at,
        ];
    }
}
