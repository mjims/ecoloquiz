<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateQuestionsTable extends Migration
{
    public function up()
    {
        Schema::create('questions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('quiz_id');
            $table->text('text');
            $table->string('type')->default('QCM'); // QCM or VRAI_FAUX
            $table->text('explanation')->nullable(); // "Le saviez-vous ?"
            $table->string('image_url')->nullable();
            $table->integer('success_rate')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('quiz_id')->references('id')->on('quizzes')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('questions');
    }
}
