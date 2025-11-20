<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmailWebhookEventsTable extends Migration
{
    public function up()
    {
        Schema::create('email_webhook_events', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->string('provider')->nullable();
            $table->string('event_type')->nullable();
            $table->json('payload')->nullable();
            $table->timestamp('received_at')->useCurrent();
            $table->timestamps();
            $table->softDeletes();
        });
    }

    public function down()
    {
        Schema::dropIfExists('email_webhook_events');
    }
}
