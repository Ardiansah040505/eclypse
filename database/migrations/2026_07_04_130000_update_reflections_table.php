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
        Schema::table('reflections', function (Blueprint $table) {
            $table->foreignId('user_id')->nullable()->constrained('users')->onDelete('cascade')->after('id');
            $table->text('question')->after('user_id');
            $table->text('answer')->nullable()->after('question');
            $table->foreignId('answered_by')->nullable()->constrained('users')->onDelete('set null')->after('answer');
            $table->timestamp('answered_at')->nullable()->after('answered_by');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('reflections', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropForeign(['answered_by']);
            $table->dropColumn(['user_id', 'question', 'answer', 'answered_by', 'answered_at']);
        });
    }
};
