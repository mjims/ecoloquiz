<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateAllocationsTable extends Migration
{
    public function up()
    {
        Schema::create('allocations', function (Blueprint $table) {
            $table->uuid('id')->primary();
            $table->uuid('gift_id');
            $table->uuid('player_id');
            $table->timestamp('allocated_at')->nullable();
            $table->string('status')->default('PENDING'); // PENDING, WON, REDEEMED, EXPIRED
            $table->timestamp('redeemed_at')->nullable();
            $table->timestamps();
            $table->softDeletes();

            $table->foreign('gift_id')->references('id')->on('gifts')->onDelete('cascade');
            $table->foreign('player_id')->references('id')->on('players')->onDelete('cascade');
        });
    }

    public function down()
    {
        Schema::dropIfExists('allocations');
    }
}
