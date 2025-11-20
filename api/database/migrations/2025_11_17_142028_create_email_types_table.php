<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmailTypesTable extends Migration
{
    public function up()
    {
        Schema::create('email_types', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('code')->unique(); // REGISTRATION, PASSWORD_RESET, LEVEL_UP, CUSTOM
            $table->string('name'); // Nom affiché
            $table->text('description')->nullable();
            $table->boolean('is_system')->default(false); // true pour les types intégrés au système
            $table->boolean('is_active')->default(true);
            $table->timestamps();
            $table->softDeletes();
        });

        // Ajouter une colonne email_type_id dans email_templates
        Schema::table('email_templates', function (Blueprint $table) {
            $table->uuid('email_type_id')->nullable()->after('id');
            $table->foreign('email_type_id')->references('id')->on('email_types')->onDelete('set null');

            // Ajouter une contrainte d'unicité: un seul template par type
            $table->unique('email_type_id', 'unique_template_per_type');
        });
    }

    public function down()
    {
        Schema::table('email_templates', function (Blueprint $table) {
            $table->dropForeign(['email_type_id']);
            $table->dropUnique('unique_template_per_type');
            $table->dropColumn('email_type_id');
        });

        Schema::dropIfExists('email_types');
    }
}
