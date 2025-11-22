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
        Schema::table('player_answers', function (Blueprint $table) {
            // Add JSON column for multiple answer IDs
            $table->json('answer_ids')->nullable()->after('answer_id');
            
            // Make answer_id nullable (for backward compatibility)
            $table->uuid('answer_id')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('player_answers', function (Blueprint $table) {
            // Remove answer_ids column
            $table->dropColumn('answer_ids');
            
            // Restore answer_id as non-nullable
            $table->uuid('answer_id')->nullable(false)->change();
        });
    }
};
