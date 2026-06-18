<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreUploadRequest;
use App\Http\Resources\ProductImportResource;
use App\Http\Resources\UploadResource;
use App\Jobs\ProcessCsvUpload;
use App\Models\ProductImport;
use App\Models\Upload;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(StoreUploadRequest $request)
    {
        $file = $request->file('csv_file');
        $storedFilename = Str::uuid() . '.csv';
        $path = $file->storeAs('csv-imports', $storedFilename, 'local');

        $upload = Upload::create([
            'original_filename' => $file->getClientOriginalName(),
            'stored_filename'   => $storedFilename,
            'file_path'         => $path,
            'file_size_bytes'   => $file->getSize(),
            'status'            => 'pending',
            'uploaded_at'       => now(),
        ]);

        Log::channel('db')->info('File uploaded successfully', [
            'upload_id' => $upload->id,
            'context'   => ['filename' => $file->getClientOriginalName(), 'size' => $file->getSize()],
        ]);

        ProcessCsvUpload::dispatch($upload);

        return (new UploadResource($upload))
            ->additional(['message' => 'Upload created.'])
            ->response()
            ->setStatusCode(202);
    }

    public function index()
    {
        $uploads = Upload::latest()->paginate(20);

        return UploadResource::collection($uploads);
    }

    public function show(Upload $upload)
    {
        return new UploadResource($upload);
    }

    public function status(Upload $upload)
    {
        return response()->json([
            'id'                  => $upload->id,
            'status'              => $upload->status,
            'total_rows'          => $upload->total_rows,
            'pending_count'       => $upload->pending_count,
            'processing_count'    => $upload->processing_count,
            'success_count'       => $upload->success_count,
            'failed_count'        => $upload->failed_count,
            'progress_percentage' => $upload->progress_percentage,
        ]);
    }

    public function products(Upload $upload, Request $request)
    {
        $query = ProductImport::where('upload_id', $upload->id);

        if ($request->has('status') && in_array($request->status, ['pending', 'processing', 'successful', 'failed'])) {
            $query->where('status', $request->status);
        }

        $products = $query->orderBy('row_number')->paginate(20);

        return ProductImportResource::collection($products);
    }
}
