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
        Schema::table('gifts', function (Blueprint $table) {
            // Ajouter code unique pour le cadeau
            $table->string('code', 10)->unique()->after('id');

            // Informations de contact
            $table->string('contact_name')->nullable()->after('siret');
            $table->string('contact_phone')->nullable()->after('contact_name');
            $table->string('contact_email')->nullable()->after('contact_phone');

            // Dates de validité (remplace expiration_date)
            $table->date('start_date')->nullable()->after('contact_email');
            $table->date('end_date')->nullable()->after('start_date');

            // Niveau associé
            $table->uuid('level_id')->nullable()->after('end_date');

            // Quantité totale
            $table->renameColumn('quantity', 'total_quantity');

            // Supprimer expiration_date qui sera remplacé par start_date/end_date
            $table->dropColumn('expiration_date');

            // Foreign key pour level
            $table->foreign('level_id')->references('id')->on('levels')->onDelete('set null');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gifts', function (Blueprint $table) {
            $table->dropForeign(['level_id']);
            $table->dropColumn([
                'code',
                'contact_name',
                'contact_phone',
                'contact_email',
                'start_date',
                'end_date',
                'level_id'
            ]);
            $table->renameColumn('total_quantity', 'quantity');
            $table->date('expiration_date')->nullable();
        });
    }
};
