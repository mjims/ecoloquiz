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
            LevelsSeeder::class,
            ThemesSeeder::class,
            QuizQuestionsSeeder::class,
        ]);

        $this->command->info('✅ Tous les seeders exécutés avec succès !');
    }
}
