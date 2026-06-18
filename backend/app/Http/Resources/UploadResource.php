<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UploadResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id'                  => $this->id,
            'original_filename'   => $this->original_filename,
            'file_size_bytes'     => $this->file_size_bytes,
            'total_rows'          => $this->total_rows,
            'status'              => $this->status,
            'error_message'       => $this->error_message,
            'success_count'       => $this->success_count,
            'failed_count'        => $this->failed_count,
            'pending_count'       => $this->pending_count,
            'processing_count'    => $this->processing_count,
            'progress_percentage' => $this->progress_percentage,
            'uploaded_at'         => $this->uploaded_at,
            'processed_at'        => $this->processed_at,
            'created_at'          => $this->created_at,
            'updated_at'          => $this->updated_at,
        ];
    }
}
