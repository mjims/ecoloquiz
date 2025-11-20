<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCompaniesTable extends Migration
{
    public function up()
    {
        Schema::create('companies', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->string('director_first_name')->nullable();
            $table->string('director_last_name')->nullable();
            $table->integer('employee_count')->nullable();
            $table->text('legal_info')->nullable();
            $table->string('unique_identifier')->nullable(); // UUID externe / SIRET / custom
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('companies');
    }
}
