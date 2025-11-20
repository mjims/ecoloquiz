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
        Schema::table('email_templates', function (Blueprint $table) {
            // Supprimer la clé étrangère
            $table->dropForeign(['email_type_id']);

            // Supprimer la contrainte d'unicité sur email_type_id
            $table->dropUnique('unique_template_per_type');

            // Recréer la clé étrangère sans contrainte d'unicité
            $table->foreign('email_type_id')
                  ->references('id')
                  ->on('email_types')
                  ->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('email_templates', function (Blueprint $table) {
            // Supprimer la clé étrangère
            $table->dropForeign(['email_type_id']);

            // Remettre la contrainte d'unicité
            $table->unique('email_type_id', 'unique_template_per_type');

            // Recréer la clé étrangère
            $table->foreign('email_type_id')
                  ->references('id')
                  ->on('email_types')
                  ->onDelete('set null');
        });
    }
};
