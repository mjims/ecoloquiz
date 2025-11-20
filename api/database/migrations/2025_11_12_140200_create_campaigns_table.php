<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCampaignsTable extends Migration
{
    public function up()
    {
        Schema::create('campaigns', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('name');
            $table->uuid('template_id')->nullable();
            $table->json('target_query')->nullable(); // { zone_ids: [], level: 'EXPERT' }
            $table->string('status')->default('DRAFT'); // DRAFT, SCHEDULED, RUNNING, PAUSED, SENT, CANCELLED
            $table->timestamp('scheduled_at')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->uuid('created_by')->nullable();
            $table->integer('total_recipients')->default(0);
            $table->integer('sent_count')->default(0);
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('template_id')->references('id')->on('email_templates')->onDelete('set null');
            $table->foreign('created_by')->references('id')->on('users')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('campaigns');
    }
}
