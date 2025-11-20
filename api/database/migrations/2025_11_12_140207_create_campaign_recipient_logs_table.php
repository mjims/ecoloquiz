<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCampaignRecipientLogsTable extends Migration
{
    public function up()
    {
        Schema::create('campaign_recipient_logs', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('campaign_id')->nullable();
            $table->uuid('template_id')->nullable();
            $table->uuid('recipient_id')->nullable();
            $table->string('provider_message_id')->nullable();
            $table->string('status')->default('QUEUED'); // QUEUED,SENT,DELIVERED,OPENED,CLICKED,BOUNCED,DROPPED
            $table->text('error')->nullable();
            $table->timestamp('sent_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('campaign_id')->references('id')->on('campaigns')->onDelete('set null');
            $table->foreign('template_id')->references('id')->on('email_templates')->onDelete('set null');
            $table->foreign('recipient_id')->references('id')->on('recipients')->onDelete('set null');
        });
    }

    public function down()
    {
        Schema::dropIfExists('campaign_recipient_logs');
    }
}
