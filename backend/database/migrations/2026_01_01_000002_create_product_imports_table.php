<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('product_imports', function (Blueprint $table) {
            $table->id();
            $table->foreignId('upload_id')->constrained('uploads')->cascadeOnDelete();
            $table->unsignedInteger('row_number');
            $table->string('handle', 255)->nullable();
            $table->string('title', 500)->nullable();
            $table->string('shopify_product_id', 100)->nullable();
            $table->string('shopify_variant_id', 100)->nullable();
            $table->enum('status', ['pending', 'processing', 'successful', 'failed'])->default('pending');
            $table->text('error_message')->nullable();
            $table->json('raw_data');
            $table->timestamps();

            $table->index('upload_id');
            $table->index('status');
            $table->index('handle');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('product_imports');
    }
};
