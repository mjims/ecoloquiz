<?php

namespace Database\Seeders;

use App\Models\EmailType;
use Illuminate\Database\Seeder;

class EmailTypeSeeder extends Seeder
{
    public function run()
    {
        $systemTypes = EmailType::getSystemTypes();

        foreach ($systemTypes as $typeData) {
            EmailType::updateOrCreate(
                ['code' => $typeData['code']],
                $typeData
            );
        }

        $this->command->info('Email types seeded successfully!');
    }
}
