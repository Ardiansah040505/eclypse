<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('literasi_materials', function (Blueprint $table) {
            $table->id();
            $table->string('title', 255);
            $table->string('subtitle', 255)->nullable();
            $table->longText('content'); // Rich HTML content
            $table->integer('order')->default(0);
            $table->string('icon', 50)->default('📦');
            $table->string('border_color', 20)->default('#1B4332');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('literasi_materials');
    }
};
