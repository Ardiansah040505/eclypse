<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('preparation_questions', function (Blueprint $table) {
            // Ubah dari string (255) ke text (unlimited) agar pertanyaan panjang bisa disimpan
            $table->text('question_text')->change();
        });
    }

    public function down(): void
    {
        Schema::table('preparation_questions', function (Blueprint $table) {
            // Kembalikan ke string(1000) — cukup besar untuk绝大部分 pertanyaan
            $table->string('question_text', 1000)->change();
        });
    }
};
