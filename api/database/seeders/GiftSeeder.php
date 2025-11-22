<?php

namespace Database\Seeders;

use App\Models\Gift;
use App\Models\Level;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class GiftSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Get levels
        $level1 = Level::where('order', 1)->first();
        $level2 = Level::where('order', 2)->first();
        $level3 = Level::where('order', 3)->first();

        $gifts = [
            [
                'name' => 'Bon d\'achat 10€ - BioCoop',
                'company_name' => 'BioCoop',
                'description' => 'Valable sur tout le magasin pour découvrir nos produits bio et locaux.',
                'image_url' => 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800',
                'total_quantity' => 50,
                'level_id' => $level1 ? $level1->id : null,
            ],
            [
                'name' => 'Kit Zéro Déchet Débutant',
                'company_name' => 'EcoLife',
                'description' => 'Contient une gourde inox, un sac à vrac et une brosse à dents en bambou.',
                'image_url' => 'https://images.unsplash.com/photo-1610557892470-55d9e80c0bce?auto=format&fit=crop&q=80&w=800',
                'total_quantity' => 20,
                'level_id' => $level1 ? $level1->id : null,
            ],
            [
                'name' => 'Atelier Compostage',
                'company_name' => 'Ville Durable',
                'description' => 'Une session de 2h pour apprendre à composter en appartement ou maison.',
                'image_url' => 'https://images.unsplash.com/photo-1584473457406-6240486418e9?auto=format&fit=crop&q=80&w=800',
                'total_quantity' => 15,
                'level_id' => $level2 ? $level2->id : null,
            ],
            [
                'name' => 'Panier de légumes bio',
                'company_name' => 'Ferme du Coin',
                'description' => 'Un panier de 5kg de fruits et légumes de saison.',
                'image_url' => 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&q=80&w=800',
                'total_quantity' => 30,
                'level_id' => $level2 ? $level2->id : null,
            ],
            [
                'name' => 'Vélo reconditionné',
                'company_name' => 'RecycleCycle',
                'description' => 'Un vélo de ville entièrement remis à neuf par nos ateliers.',
                'image_url' => 'https://images.unsplash.com/photo-1485965120184-e224f7a1adb1?auto=format&fit=crop&q=80&w=800',
                'total_quantity' => 5,
                'level_id' => $level3 ? $level3->id : null,
            ],
            [
                'name' => 'Week-end Eco-Lodge',
                'company_name' => 'GreenEscape',
                'description' => 'Deux nuits pour 2 personnes dans un éco-lodge en pleine nature.',
                'image_url' => 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=800',
                'total_quantity' => 2,
                'level_id' => $level3 ? $level3->id : null,
            ],
        ];

        foreach ($gifts as $giftData) {
            Gift::create(array_merge($giftData, [
                'start_date' => now(),
                'end_date' => now()->addYear(),
                'metadata' => ['zones' => []]
            ]));
        }
    }
}
