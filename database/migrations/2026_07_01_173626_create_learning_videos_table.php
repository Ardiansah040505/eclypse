<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('learning_videos', function (Blueprint $table) {
            $table->id();
            $table->string('title')->nullable();
            $table->string('youtube_url')->nullable();
            $table->text('description')->nullable();
            $table->boolean('is_active')->default(false);
            $table->string('stage')->default('tahap2'); // Stage: tahap1, tahap2, tahap3, etc.
            $table->integer('order')->default(0); // Order within the stage
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('learning_videos');
    }
};
