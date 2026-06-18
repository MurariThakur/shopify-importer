<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('import_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('upload_id')->nullable()->constrained('uploads')->nullOnDelete();
            $table->foreignId('product_import_id')->nullable()->constrained('product_imports')->nullOnDelete();
            $table->enum('level', ['info', 'warning', 'error', 'debug']);
            $table->text('message');
            $table->json('context')->nullable();
            $table->timestamp('created_at')->useCurrent();

            $table->index('upload_id');
            $table->index('level');
            $table->index('created_at');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('import_logs');
    }
};
