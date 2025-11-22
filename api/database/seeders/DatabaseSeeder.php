<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $this->call([
            RolesPermissionsSeeder::class,
            AdminUsersSeeder::class,
            ZoneSeeder::class,
            EmailTypeSeeder::class,
            SystemEmailTemplateSeeder::class,
            LevelsSeeder::class,
            ThemeSeeder::class,
            QuizQuestionsSeeder::class,
        ]);

        $this->command->info('✅ Tous les seeders exécutés avec succès !');
    }
}
