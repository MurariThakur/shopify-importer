<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ProductImport extends Model
{
    protected $fillable = [
        'upload_id',
        'row_number',
        'handle',
        'title',
        'shopify_product_id',
        'shopify_variant_id',
        'status',
        'error_message',
        'raw_data',
    ];

    protected $casts = [
        'raw_data' => 'array',
    ];

    public function upload(): BelongsTo
    {
        return $this->belongsTo(Upload::class);
    }

    public function importLogs(): HasMany
    {
        return $this->hasMany(ImportLog::class);
    }
}
