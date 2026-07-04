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
        Schema::create('student_news_answers', function (Blueprint $table) {
            $table->id();

            $table->foreignId('student_id')
                  ->constrained('users')
                  ->cascadeOnDelete();

            $table->foreignId('news_id')
                  ->constrained('learning_news')
                  ->cascadeOnDelete();

            // JSON berisi semua jawaban: {"0": 2, "1": "jawaban esai...", "2": 0}
            $table->json('answers');

            // Progress: berapa % soal yang sudah dijawab
            $table->integer('answered_count')->default(0);
            $table->integer('total_questions')->default(0);

            // Status selesai atau belum
            $table->boolean('is_completed')->default(false);

            $table->timestamps();

            // 1 student 1 answer per news
            $table->unique(['student_id', 'news_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('student_news_answers');
    }
};
