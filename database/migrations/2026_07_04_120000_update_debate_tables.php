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
        // Update debate_groups table - add kancing_count
        Schema::table('debate_groups', function (Blueprint $table) {
            $table->integer('kancing_count')->default(5)->after('icon');
        });

        // Update debate_sessions table - add fields
        Schema::table('debate_sessions', function (Blueprint $table) {
            $table->string('topic')->nullable()->after('id');
            $table->enum('status', ['waiting', 'active', 'finished'])->default('waiting')->after('topic');
            $table->unsignedBigInteger('pro_group_id')->nullable()->after('status');
            $table->unsignedBigInteger('con_group_id')->nullable()->after('pro_group_id');
        });

        // Create debate_arguments table
        Schema::create('debate_arguments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debate_session_id')->constrained('debate_sessions')->onDelete('cascade');
            $table->foreignId('user_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('debate_group_id')->constrained('debate_groups')->onDelete('cascade');
            $table->text('content');
            $table->string('side'); // 'pro' or 'con'
            $table->timestamps();
        });

        // Create debate_kancing_logs table
        Schema::create('debate_kancing_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('debate_session_id')->constrained('debate_sessions')->onDelete('cascade');
            $table->foreignId('debate_group_id')->constrained('debate_groups')->onDelete('cascade');
            $table->foreignId('reduced_by')->nullable()->constrained('users')->onDelete('set null');
            $table->integer('kancing_before');
            $table->integer('kancing_after');
            $table->string('reason')->default('argument_submitted');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debate_kancing_logs');
        Schema::dropIfExists('debate_arguments');
        Schema::table('debate_sessions', function (Blueprint $table) {
            $table->dropColumn(['topic', 'status', 'pro_group_id', 'con_group_id']);
        });
        Schema::table('debate_groups', function (Blueprint $table) {
            $table->dropColumn(['kancing_count']);
        });
    }
};
