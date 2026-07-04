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
      Schema::create('news_answers', function (Blueprint $table) {
        $table->id();

        $table->foreignId('student_id')
              ->constrained('users')
              ->cascadeOnDelete();

        $table->foreignId('news_question_id')
              ->constrained()
              ->cascadeOnDelete();

        $table->longText('answer');

        $table->decimal('score', 5, 2)->nullable();

        $table->timestamps();
     });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('news_answers');
    }
};
