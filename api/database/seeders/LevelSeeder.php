<?php

namespace Database\Seeders;

use App\Models\Level;
use Illuminate\Database\Seeder;

class LevelSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $levels = [
            ['name' => 'Découverte', 'slug' => 'decouverte', 'order' => 1],
            ['name' => 'Connaisseur', 'slug' => 'connaisseur', 'order' => 2],
            ['name' => 'Expert', 'slug' => 'expert', 'order' => 3],
        ];

        foreach ($levels as $level) {
            Level::firstOrCreate(
                ['slug' => $level['slug']],
                $level
            );
        }
    }
}
