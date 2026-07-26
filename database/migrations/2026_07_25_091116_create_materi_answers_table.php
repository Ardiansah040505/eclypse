<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('materi_answers', function (Blueprint $table) {
            $table->id();
            $table->foreignId('question_id')->constrained('materi_questions')->onDelete('cascade');
            $table->foreignId('student_id')->constrained('users')->onDelete('cascade');
            $table->longText('answer');
            $table->timestamps();

            $table->unique(['question_id', 'student_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('materi_answers');
    }
};
