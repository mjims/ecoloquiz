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
        Schema::table('quizzes', function (Blueprint $table) {
            // Supprimer l'ancienne colonne level (string)
            $table->dropColumn('level');

            // Ajouter level_id avec foreign key
            $table->unsignedBigInteger('level_id')->after('theme_id');
            $table->foreign('level_id')->references('id')->on('levels')->onDelete('cascade');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('quizzes', function (Blueprint $table) {
            $table->dropForeign(['level_id']);
            $table->dropColumn('level_id');

            // Restaurer la colonne level
            $table->string('level')->default('DECOUVERTE')->after('theme_id');
        });
    }
};
