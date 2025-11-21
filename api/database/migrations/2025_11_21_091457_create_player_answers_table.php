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
        Schema::create('player_answers', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('player_id');
            $table->uuid('question_id');
            $table->uuid('answer_id');
            $table->boolean('is_correct');
            $table->integer('points_earned');
            $table->timestamp('answered_at');
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
            $table->foreign('question_id')->references('id')->on('questions')->onDelete('cascade');
            $table->foreign('answer_id')->references('id')->on('answer_options')->onDelete('cascade');

            // Ensure a player can only answer a question once
            $table->unique(['player_id', 'question_id']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('player_answers');
    }
};
