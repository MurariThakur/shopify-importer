<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreUploadRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'csv_file' => ['required', 'file', 'mimes:csv,txt', 'max:10240'],
        ];
    }

    public function messages(): array
    {
        return [
            'csv_file.required' => 'A CSV file is required.',
            'csv_file.file'     => 'The upload must be a valid file.',
            'csv_file.mimes'    => 'The file must be a CSV file.',
            'csv_file.max'      => 'The file may not be larger than 10 MB.',
        ];
    }
}
