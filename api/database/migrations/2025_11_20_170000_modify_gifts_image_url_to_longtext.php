<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('gifts', function (Blueprint $table) {
            // Modifier image_url de VARCHAR(255) à LONGTEXT pour supporter les images base64
            $table->longText('image_url')->nullable()->change();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('gifts', function (Blueprint $table) {
            // Revenir à string (VARCHAR(255))
            $table->string('image_url')->nullable()->change();
        });
    }
};
