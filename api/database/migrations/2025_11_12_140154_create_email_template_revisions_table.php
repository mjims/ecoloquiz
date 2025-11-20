<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmailTemplateRevisionsTable extends Migration
{
    public function up()
    {
        Schema::create('email_template_revisions', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('template_id');
            $table->integer('version')->default(1);
            $table->string('subject')->nullable();
            $table->text('body_html')->nullable();
            $table->text('body_text')->nullable();
            $table->uuid('editor_id')->nullable();
            $table->timestamp('created_at')->useCurrent();
            $table->text('note')->nullable();
            $table->softDeletes();

            $table->foreign('template_id')->references('id')->on('email_templates')->onDelete('cascade');
            $table->foreign('editor_id')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('email_template_revisions');
    }
}
