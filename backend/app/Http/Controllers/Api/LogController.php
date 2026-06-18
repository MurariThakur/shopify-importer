<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ImportLogResource;
use App\Models\ImportLog;
use App\Models\Upload;
use Illuminate\Http\Request;

class LogController extends Controller
{
    public function index(Request $request)
    {
        $query = ImportLog::latest();

        if ($request->has('level') && in_array($request->level, ['info', 'warning', 'error', 'debug'])) {
            $query->where('level', $request->level);
        }

        $logs = $query->paginate(50);

        return ImportLogResource::collection($logs);
    }

    public function forUpload(Upload $upload, Request $request)
    {
        $query = ImportLog::where('upload_id', $upload->id)->latest();

        if ($request->has('level') && in_array($request->level, ['info', 'warning', 'error', 'debug'])) {
            $query->where('level', $request->level);
        }

        $logs = $query->paginate(50);

        return ImportLogResource::collection($logs);
    }
}
