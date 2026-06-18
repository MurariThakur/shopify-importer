<?php

namespace App\Jobs;

use App\Models\ProductImport;
use App\Models\Upload;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Filesystem\FileNotFoundException;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ProcessCsvUpload implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $timeout = 300;
    public int $backoff = 60;

    private const REQUIRED_COLUMNS = [
        'Handle', 'Title', 'Body HTML', 'Vendor', 'Product Type', 'Tags', 'Published',
        'Variant SKU', 'Variant Price', 'Variant Compare At Price', 'Variant Requires Shipping',
        'Variant Taxable', 'Variant Inventory Tracker', 'Variant Inventory Qty',
        'Variant Inventory Policy', 'Variant Fulfillment Service', 'Variant Weight',
        'Variant Weight Unit', 'Image Src', 'Image Position', 'Image Alt Text',
    ];

    public function __construct(
        private Upload $upload
    ) {}

    public function handle(): void
    {
        $this->upload->update(['status' => 'processing']);

        Log::channel('db')->info('CSV processing started', [
            'upload_id' => $this->upload->id,
        ]);

        $path = Storage::disk('local')->path($this->upload->file_path);

        if (!file_exists($path)) {
            throw new FileNotFoundException("CSV file not found: {$path}");
        }

        $handle = fopen($path, 'r');
        $header = fgetcsv($handle);

        if ($header === false || $header === null) {
            fclose($handle);
            $this->failUpload('CSV file has no header row.');
            return;
        }

        $missingColumns = array_diff(self::REQUIRED_COLUMNS, $header);
        if (!empty($missingColumns)) {
            fclose($handle);
            $msg = 'Missing required columns: ' . implode(', ', $missingColumns);
            $this->failUpload($msg);
            return;
        }

        $header = array_map('trim', $header);
        $rowNumber = 0;
        $totalRows = 0;

        while (($row = fgetcsv($handle)) !== false) {
            if (count($row) !== count($header)) {
                continue;
            }

            $row = array_map('trim', $row);
            $rawData = array_combine($header, $row);

            if ($rawData === false) {
                continue;
            }

            $nonEmpty = array_filter($row, fn($v) => $v !== '');
            if (empty($nonEmpty)) {
                continue;
            }

            $rowNumber++;
            $totalRows++;

            $validationErrors = $this->validateRow($rawData, $rowNumber);

            if (!empty($validationErrors)) {
                ProductImport::create([
                    'upload_id'     => $this->upload->id,
                    'row_number'    => $rowNumber,
                    'handle'        => $rawData['Handle'] ?? null,
                    'title'         => $rawData['Title'] ?? null,
                    'status'        => 'failed',
                    'error_message' => implode('; ', $validationErrors),
                    'raw_data'      => $rawData,
                ]);

                Log::channel('db')->warning('Row validation failed', [
                    'upload_id' => $this->upload->id,
                    'context'   => ['row' => $rowNumber, 'errors' => $validationErrors],
                ]);
            } else {
                ProductImport::create([
                    'upload_id'  => $this->upload->id,
                    'row_number' => $rowNumber,
                    'handle'     => $rawData['Handle'] ?? null,
                    'title'      => $rawData['Title'] ?? null,
                    'status'     => 'pending',
                    'raw_data'   => $rawData,
                ]);
            }
        }

        fclose($handle);

        if ($totalRows === 0) {
            $this->failUpload('No data rows found in CSV.');
            return;
        }

        $this->upload->update(['total_rows' => $totalRows]);

        $pendingImports = $this->upload->productImports()->where('status', 'pending')->get();
        foreach ($pendingImports as $productImport) {
            ProcessShopifyProduct::dispatch($productImport)
                ->onQueue('default');
        }

        Log::channel('db')->info('CSV processing completed', [
            'upload_id' => $this->upload->id,
            'context'   => ['total_rows' => $totalRows, 'pending' => $pendingImports->count()],
        ]);
    }

    public function failed(\Throwable $e): void
    {
        $this->failUpload($e->getMessage());

        Log::channel('db')->error('CSV upload job failed', [
            'upload_id' => $this->upload->id,
            'context'   => ['error' => $e->getMessage()],
        ]);
    }

    private function failUpload(string $message): void
    {
        $this->upload->update([
            'status'        => 'failed',
            'error_message' => $message,
        ]);

        Log::channel('db')->error($message, [
            'upload_id' => $this->upload->id,
        ]);
    }

    private function validateRow(array $row, int $rowNumber): array
    {
        $errors = [];

        if (empty($row['Handle'] ?? '')) {
            $errors[] = "Row {$rowNumber}: Handle is required";
        } elseif (strlen($row['Handle']) > 255) {
            $errors[] = "Row {$rowNumber}: Handle must be ≤ 255 characters";
        } elseif (!preg_match('/^[a-z0-9\-]+$/', $row['Handle'])) {
            $errors[] = "Row {$rowNumber}: Handle must contain only lowercase letters, numbers, and hyphens";
        }

        if (empty($row['Title'] ?? '')) {
            $errors[] = "Row {$rowNumber}: Title is required";
        } elseif (strlen($row['Title']) > 500) {
            $errors[] = "Row {$rowNumber}: Title must be ≤ 500 characters";
        }

        if (!isset($row['Variant Price']) || $row['Variant Price'] === '') {
            $errors[] = "Row {$rowNumber}: Variant Price is required";
        } elseif (!is_numeric($row['Variant Price']) || (float) $row['Variant Price'] <= 0) {
            $errors[] = "Row {$rowNumber}: Variant Price must be a positive number";
        }

        if (!empty($row['Variant Compare At Price'])) {
            if (!is_numeric($row['Variant Compare At Price'])) {
                $errors[] = "Row {$rowNumber}: Variant Compare At Price must be numeric";
            } elseif ((float) $row['Variant Compare At Price'] < (float) ($row['Variant Price'] ?? 0)) {
                $errors[] = "Row {$rowNumber}: Compare At Price must be ≥ Variant Price";
            }
        }

        if (!empty($row['Variant SKU']) && strlen($row['Variant SKU']) > 100) {
            $errors[] = "Row {$rowNumber}: Variant SKU must be ≤ 100 characters";
        }

        if (!isset($row['Variant Inventory Qty']) || $row['Variant Inventory Qty'] === '') {
            $errors[] = "Row {$rowNumber}: Variant Inventory Qty is required";
        } elseif (!ctype_digit((string) $row['Variant Inventory Qty']) || (int) $row['Variant Inventory Qty'] < 0) {
            $errors[] = "Row {$rowNumber}: Variant Inventory Qty must be a non-negative integer";
        }

        if (!empty($row['Image Src']) && !filter_var($row['Image Src'], FILTER_VALIDATE_URL)) {
            $errors[] = "Row {$rowNumber}: Image Src must be a valid URL";
        }

        if (!empty($row['Variant Weight'])) {
            if (!is_numeric($row['Variant Weight']) || (float) $row['Variant Weight'] < 0) {
                $errors[] = "Row {$rowNumber}: Variant Weight must be a non-negative number";
            }
        }

        return $errors;
    }
}
