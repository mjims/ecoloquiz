<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateZonesTable extends Migration
{
    public function up()
    {
        Schema::create('zones', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('type')->index(); // REGION, DEPT, VILLE, CODE_POSTAL, ENTREPRISE
            $table->string('name');
            $table->string('code_postal')->nullable();
            $table->uuid('parent_zone_id')->nullable();
            $table->json('metadata')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('parent_zone_id')->references('id')->on('zones')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('zones');
    }
}
