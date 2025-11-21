<?php

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Seeder;

class LevelsSeeder extends Seeder
{
    public function run(): void
    {
        $levels = [
            [
                'name' => 'Découverte',
                'slug' => 'decouverte',
                'order' => 1,
            ],
            [
                'name' => 'Connaisseur',
                'slug' => 'connaisseur',
                'order' => 2,
            ],
            [
                'name' => 'Expert',
                'slug' => 'expert',
                'order' => 3,
            ],
        ];

        foreach ($levels as $levelData) {
            Level::updateOrCreate(
                ['slug' => $levelData['slug']],
                $levelData
            );
        }

        $this->command->info('✅ Levels seeded successfully!');
    }
}
