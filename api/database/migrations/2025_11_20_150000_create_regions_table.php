<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('regions', function (Blueprint $table) {
            $table->id();
            $table->string('code', 2)->unique();
            $table->string('name', 255);
            $table->timestamps();
        });

        // Insertion des 13 régions métropolitaines
        $regions = [
            ['code' => '11', 'name' => 'Île-de-France'],
            ['code' => '84', 'name' => 'Auvergne-Rhône-Alpes'],
            ['code' => '75', 'name' => 'Nouvelle-Aquitaine'],
            ['code' => '76', 'name' => 'Occitanie'],
            ['code' => '32', 'name' => 'Hauts-de-France'],
            ['code' => '93', 'name' => 'Provence-Alpes-Côte d\'Azur'],
            ['code' => '44', 'name' => 'Grand Est'],
            ['code' => '52', 'name' => 'Pays de la Loire'],
            ['code' => '53', 'name' => 'Bretagne'],
            ['code' => '28', 'name' => 'Normandie'],
            ['code' => '27', 'name' => 'Bourgogne-Franche-Comté'],
            ['code' => '24', 'name' => 'Centre-Val de Loire'],
            ['code' => '94', 'name' => 'Corse'],
        ];

        foreach ($regions as $region) {
            DB::table('regions')->insert([
                'code' => $region['code'],
                'name' => $region['name'],
                'created_at' => now(),
                'updated_at' => now(),
            ]);
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('regions');
    }
};
