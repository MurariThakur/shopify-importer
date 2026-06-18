<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImportLog extends Model
{
    public $timestamps = false;

    protected $fillable = [
        'upload_id',
        'product_import_id',
        'level',
        'message',
        'context',
        'created_at',
    ];

    protected $casts = [
        'context'    => 'array',
        'created_at' => 'datetime',
    ];

    public function upload(): BelongsTo
    {
        return $this->belongsTo(Upload::class);
    }

    public function productImport(): BelongsTo
    {
        return $this->belongsTo(ProductImport::class);
    }
}
