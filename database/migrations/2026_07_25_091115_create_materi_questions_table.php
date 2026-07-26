<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materi_questions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('material_id')->constrained('literasi_materials')->onDelete('cascade');
            $table->text('question_text');
            $table->integer('order')->default(0);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materi_questions');
    }
};
