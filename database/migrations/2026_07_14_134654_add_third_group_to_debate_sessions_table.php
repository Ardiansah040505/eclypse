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
        Schema::table('debate_sessions', function (Blueprint $table) {
            $table->unsignedBigInteger('third_group_id')->nullable()->after('con_group_id');
            $table->foreign('third_group_id')->references('id')->on('debate_groups')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('debate_sessions', function (Blueprint $table) {
            //
        });
    }
};
