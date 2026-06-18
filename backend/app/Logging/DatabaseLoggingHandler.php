<?php

namespace App\Logging;

use App\Models\ImportLog;
use Monolog\Handler\AbstractProcessingHandler;
use Monolog\Level;
use Monolog\LogRecord;

class DatabaseLoggingHandler extends AbstractProcessingHandler
{
    protected function write(LogRecord $record): void
    {
        $context = $record->context;
        $uploadId = $context['upload_id'] ?? $record->extra['upload_id'] ?? null;
        $productImportId = $context['product_import_id'] ?? $record->extra['product_import_id'] ?? null;

        unset($context['upload_id'], $context['product_import_id']);

        ImportLog::create([
            'upload_id'         => $uploadId,
            'product_import_id' => $productImportId,
            'level'             => strtolower($record->level->getName()),
            'message'           => $record->message,
            'context'           => !empty($context) ? $context : null,
            'created_at'        => $record->datetime,
        ]);
    }
}
