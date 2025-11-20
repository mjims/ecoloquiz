<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateQuizzesTable extends Migration
{
    public function up()
    {
        Schema::create('quizzes', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('title');
            $table->uuid('theme_id')->nullable();
            $table->string('level')->default('DECOUVERTE');
            $table->integer('max_score')->default(100);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('theme_id')->references('id')->on('themes')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('quizzes');
    }
}
