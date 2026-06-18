<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\UploadController;
use App\Http\Controllers\Api\LogController;

Route::post('/uploads',                    [UploadController::class, 'store']);
Route::get('/uploads',                     [UploadController::class, 'index']);
Route::get('/uploads/{upload}',            [UploadController::class, 'show']);
Route::get('/uploads/{upload}/status',     [UploadController::class, 'status']);
Route::get('/uploads/{upload}/products',   [UploadController::class, 'products']);

Route::get('/logs',                        [LogController::class, 'index']);
Route::get('/uploads/{upload}/logs',       [LogController::class, 'forUpload']);
