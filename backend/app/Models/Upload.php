<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Upload extends Model
{
    protected $fillable = [
        'original_filename',
        'stored_filename',
        'file_path',
        'file_size_bytes',
        'total_rows',
        'status',
        'error_message',
        'uploaded_at',
        'processed_at',
    ];

    protected $casts = [
        'uploaded_at'  => 'datetime',
        'processed_at' => 'datetime',
    ];

    protected $appends = [
        'success_count',
        'failed_count',
        'pending_count',
        'processing_count',
        'progress_percentage',
    ];

    public function productImports(): HasMany
    {
        return $this->hasMany(ProductImport::class);
    }

    public function importLogs(): HasMany
    {
        return $this->hasMany(ImportLog::class);
    }

    public function getSuccessCountAttribute(): int
    {
        return $this->productImports()->where('status', 'successful')->count();
    }

    public function getFailedCountAttribute(): int
    {
        return $this->productImports()->where('status', 'failed')->count();
    }

    public function getPendingCountAttribute(): int
    {
        return $this->productImports()->where('status', 'pending')->count();
    }

    public function getProcessingCountAttribute(): int
    {
        return $this->productImports()->where('status', 'processing')->count();
    }

    public function getProgressPercentageAttribute(): int
    {
        if ($this->total_rows <= 0) {
            return 0;
        }

        $processed = $this->success_count + $this->failed_count;
        return (int) round(($processed / $this->total_rows) * 100);
    }
}
