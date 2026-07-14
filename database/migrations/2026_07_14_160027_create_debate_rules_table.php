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
        Schema::create('debate_rules', function (Blueprint $table) {
            $table->id();
            $table->string('title', 100)->comment('Judul aturan');
            $table->text('description')->comment('Deskripsi detail aturan');
            $table->integer('order')->default(0)->comment('Urutan tampil');
            $table->boolean('is_active')->default(true)->comment('Aktif atau tidak');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('debate_rules');
    }
};
