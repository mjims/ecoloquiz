<?php

namespace Database\Seeders;

use App\Models\Theme;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class ThemesSeeder extends Seeder
{
    public function run(): void
    {
        $themes = [
            [
                'title' => 'Déchets et Recyclage',
                'description' => 'Apprends les bonnes pratiques de tri et de recyclage des déchets pour réduire ton impact environnemental.',
            ],
            [
                'title' => 'Énergie',
                'description' => 'Découvre comment économiser l\'énergie au quotidien et favoriser les énergies renouvelables.',
            ],
            [
                'title' => 'Biodiversité',
                'description' => 'Explore l\'importance de la biodiversité et apprends à protéger les écosystèmes qui nous entourent.',
            ],
            [
                'title' => 'Consommation responsable',
                'description' => 'Adopte des habitudes de consommation plus durables et responsables pour préserver notre planète.',
            ],
        ];

        foreach ($themes as $themeData) {
            $existingTheme = Theme::where('title', $themeData['title'])->first();

            if ($existingTheme) {
                // Update existing theme
                $existingTheme->update([
                    'description' => $themeData['description'],
                ]);
            } else {
                // Create new theme
                Theme::create([
                    'id' => Str::uuid(),
                    'title' => $themeData['title'],
                    'description' => $themeData['description'],
                ]);
            }
        }

        $this->command->info('✅ Themes seeded successfully!');
    }
}
