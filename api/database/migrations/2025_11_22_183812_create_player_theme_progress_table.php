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
        Schema::create('player_theme_progress', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('player_id');
            $table->uuid('theme_id');
            $table->unsignedBigInteger('current_level_id'); // Changed from uuid to match levels.id
            $table->timestamp('last_played_at')->nullable();
            $table->timestamps();

            // Foreign keys
            $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
            $table->foreign('theme_id')->references('id')->on('themes')->onDelete('cascade');
            $table->foreign('current_level_id')->references('id')->on('levels')->onDelete('cascade');

            // Unique constraint: one progress record per player per theme
            $table->unique(['player_id', 'theme_id']);

            // Indexes for performance
            $table->index('player_id');
            $table->index(['player_id', 'last_played_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_theme_progress');
    }
};
