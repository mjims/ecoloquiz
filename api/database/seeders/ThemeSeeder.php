<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ThemeSeeder extends Seeder
{
    public function run(): void
    {
        $themes = [
            [
                'id' => Str::uuid(),
                'title' => 'Déchets et Recyclage',
                'description' => 'Tout savoir sur le tri sélectif, le compostage et la réduction des déchets',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Énergie',
                'description' => 'Comprendre les énergies renouvelables et les économies d\'énergie',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Biodiversité',
                'description' => 'Préserver la faune et la flore locales',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Consommation responsable',
                'description' => 'Adopter une consommation éthique et durable',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Eau',
                'description' => 'Économiser et protéger les ressources en eau',
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'title' => 'Mobilité durable',
                'description' => 'Se déplacer de manière écologique',
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('themes')->insert($themes);
    }
}
