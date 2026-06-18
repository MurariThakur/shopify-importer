<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ImportLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                => $this->id,
            'upload_id'         => $this->upload_id,
            'product_import_id' => $this->product_import_id,
            'level'             => $this->level,
            'message'           => $this->message,
            'context'           => $this->context,
            'created_at'        => $this->created_at,
        ];
    }
}
