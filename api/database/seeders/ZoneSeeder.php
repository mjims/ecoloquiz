<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class ZoneSeeder extends Seeder
{
    public function run(): void
    {
        // Régions
        $idf = Str::uuid();
        $ara = Str::uuid();
        $paca = Str::uuid();

        $regions = [
            [
                'id' => $idf,
                'type' => 'REGION',
                'name' => 'Île-de-France',
                'code_postal' => null,
                'parent_zone_id' => null,
                'metadata' => json_encode(['code' => '11']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $ara,
                'type' => 'REGION',
                'name' => 'Auvergne-Rhône-Alpes',
                'code_postal' => null,
                'parent_zone_id' => null,
                'metadata' => json_encode(['code' => '84']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $paca,
                'type' => 'REGION',
                'name' => 'Provence-Alpes-Côte d\'Azur',
                'code_postal' => null,
                'parent_zone_id' => null,
                'metadata' => json_encode(['code' => '93']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Départements
        $paris = Str::uuid();
        $hautsdeseine = Str::uuid();
        $rhone = Str::uuid();
        $bdr = Str::uuid();

        $departments = [
            [
                'id' => $paris,
                'type' => 'DEPT',
                'name' => 'Paris',
                'code_postal' => '75',
                'parent_zone_id' => $idf,
                'metadata' => json_encode(['code' => '75']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $hautsdeseine,
                'type' => 'DEPT',
                'name' => 'Hauts-de-Seine',
                'code_postal' => '92',
                'parent_zone_id' => $idf,
                'metadata' => json_encode(['code' => '92']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $rhone,
                'type' => 'DEPT',
                'name' => 'Rhône',
                'code_postal' => '69',
                'parent_zone_id' => $ara,
                'metadata' => json_encode(['code' => '69']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => $bdr,
                'type' => 'DEPT',
                'name' => 'Bouches-du-Rhône',
                'code_postal' => '13',
                'parent_zone_id' => $paca,
                'metadata' => json_encode(['code' => '13']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        // Villes
        $cities = [
            [
                'id' => Str::uuid(),
                'type' => 'VILLE',
                'name' => 'Paris 15ème',
                'code_postal' => '75015',
                'parent_zone_id' => $paris,
                'metadata' => json_encode(['insee' => '75115']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'type' => 'VILLE',
                'name' => 'Boulogne-Billancourt',
                'code_postal' => '92100',
                'parent_zone_id' => $hautsdeseine,
                'metadata' => json_encode(['insee' => '92012']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'type' => 'VILLE',
                'name' => 'Lyon',
                'code_postal' => '69000',
                'parent_zone_id' => $rhone,
                'metadata' => json_encode(['insee' => '69123']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
            [
                'id' => Str::uuid(),
                'type' => 'VILLE',
                'name' => 'Marseille',
                'code_postal' => '13000',
                'parent_zone_id' => $bdr,
                'metadata' => json_encode(['insee' => '13055']),
                'created_at' => now(),
                'updated_at' => now(),
            ],
        ];

        DB::table('zones')->insert(array_merge($regions, $departments, $cities));
    }
}
