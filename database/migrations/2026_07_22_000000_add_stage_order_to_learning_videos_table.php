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
        Schema::table('learning_videos', function (Blueprint $table) {
            if (!Schema::hasColumn('learning_videos', 'stage')) {
                $table->string('stage')->default('tahap2')->after('is_active');
            }
            if (!Schema::hasColumn('learning_videos', 'order')) {
                $table->integer('order')->default(0)->after('stage');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('learning_videos', function (Blueprint $table) {
            $table->dropColumn(['stage', 'order']);
        });
    }
};
