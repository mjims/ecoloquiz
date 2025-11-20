<?php

namespace Database\Seeders;

use App\Models\EmailTemplate;
use App\Models\EmailType;
use Illuminate\Database\Seeder;

class SystemEmailTemplateSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Les templates système seront créés sans created_by (système)

        // Template pour REGISTRATION (Confirmation d'inscription)
        $registrationType = EmailType::where('code', 'REGISTRATION')->first();
        if ($registrationType && !EmailTemplate::where('email_type_id', $registrationType->id)->exists()) {
            EmailTemplate::create([
                'name' => 'Confirmation d\'inscription',
                'code' => 'confirmation-inscription',
                'email_type_id' => $registrationType->id,
                'type' => 'transactional',
                'target_types' => 'JOUEURS',
                'subject' => 'Bienvenue sur EcoloQuiz - Confirmez votre inscription',
                'sender_name' => 'EcoloQuiz',
                'sender_email' => 'noreply@ecoloquiz.com',
                'body_html' => '<h1>Bienvenue sur EcoloQuiz !</h1>
                    <p>Bonjour {{prenom}},</p>
                    <p>Merci de vous être inscrit sur EcoloQuiz. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :</p>
                    <p><a href="{{confirmation_url}}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Confirmer mon inscription</a></p>
                    <p>Si vous n\'avez pas créé de compte, vous pouvez ignorer cet email.</p>
                    <p>À bientôt,<br>L\'équipe EcoloQuiz</p>',
                'body_text' => 'Bienvenue sur EcoloQuiz !

Bonjour {{prenom}},

Merci de vous être inscrit sur EcoloQuiz. Pour activer votre compte, veuillez cliquer sur le lien ci-dessous :

{{confirmation_url}}

Si vous n\'avez pas créé de compte, vous pouvez ignorer cet email.

À bientôt,
L\'équipe EcoloQuiz',
                'variables_schema' => ['prenom', 'nom', 'email', 'confirmation_url'],
                'is_active' => true,
                
            ]);
            $this->command->info('✓ Template REGISTRATION créé');
        }

        // Template pour PASSWORD_RESET (Réinitialisation de mot de passe)
        $passwordResetType = EmailType::where('code', 'PASSWORD_RESET')->first();
        if ($passwordResetType && !EmailTemplate::where('email_type_id', $passwordResetType->id)->exists()) {
            EmailTemplate::create([
                'name' => 'Réinitialisation de mot de passe',
                'code' => 'reset-password',
                'email_type_id' => $passwordResetType->id,
                'type' => 'transactional',
                'target_types' => 'JOUEURS',
                'subject' => 'Réinitialisation de votre mot de passe - EcoloQuiz',
                'sender_name' => 'EcoloQuiz',
                'sender_email' => 'noreply@ecoloquiz.com',
                'body_html' => '<h1>Réinitialisation de mot de passe</h1>
                    <p>Bonjour {{prenom}},</p>
                    <p>Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :</p>
                    <p><a href="{{reset_url}}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Réinitialiser mon mot de passe</a></p>
                    <p>Ce lien est valide pendant 60 minutes.</p>
                    <p>Si vous n\'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.</p>
                    <p>Cordialement,<br>L\'équipe EcoloQuiz</p>',
                'body_text' => 'Réinitialisation de mot de passe

Bonjour {{prenom}},

Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe :

{{reset_url}}

Ce lien est valide pendant 60 minutes.

Si vous n\'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.

Cordialement,
L\'équipe EcoloQuiz',
                'variables_schema' => ['prenom', 'nom', 'email', 'reset_url'],
                'is_active' => true,
                
            ]);
            $this->command->info('✓ Template PASSWORD_RESET créé');
        }

        // Template pour LEVEL_UP (Passage de niveau)
        $levelUpType = EmailType::where('code', 'LEVEL_UP')->first();
        if ($levelUpType && !EmailTemplate::where('email_type_id', $levelUpType->id)->exists()) {
            EmailTemplate::create([
                'name' => 'Félicitations - Nouveau niveau atteint',
                'code' => 'level-up',
                'email_type_id' => $levelUpType->id,
                'type' => 'transactional',
                'target_types' => 'JOUEURS',
                'subject' => 'Félicitations ! Vous avez atteint le niveau {{level_name}}',
                'sender_name' => 'EcoloQuiz',
                'sender_email' => 'noreply@ecoloquiz.com',
                'body_html' => '<h1>🎉 Félicitations {{prenom}} !</h1>
                    <p>Vous venez de passer au niveau <strong>{{level_name}}</strong> !</p>
                    <p>Votre score : <strong>{{score}} points</strong></p>
                    <p>Continuez comme ça ! De nouveaux défis vous attendent au prochain niveau.</p>
                    <p><a href="{{dashboard_url}}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir mon tableau de bord</a></p>
                    <p>Bonne chance pour la suite !<br>L\'équipe EcoloQuiz</p>',
                'body_text' => '🎉 Félicitations {{prenom}} !

Vous venez de passer au niveau {{level_name}} !

Votre score : {{score}} points

Continuez comme ça ! De nouveaux défis vous attendent au prochain niveau.

Voir mon tableau de bord : {{dashboard_url}}

Bonne chance pour la suite !
L\'équipe EcoloQuiz',
                'variables_schema' => ['prenom', 'nom', 'level_name', 'score', 'dashboard_url'],
                'is_active' => true,
                
            ]);
            $this->command->info('✓ Template LEVEL_UP créé');
        }

        // Template pour GIFT_WON (Cadeau gagné)
        $giftWonType = EmailType::where('code', 'GIFT_WON')->first();
        if ($giftWonType && !EmailTemplate::where('email_type_id', $giftWonType->id)->exists()) {
            EmailTemplate::create([
                'name' => 'Vous avez gagné un cadeau',
                'code' => 'gift-won',
                'email_type_id' => $giftWonType->id,
                'type' => 'transactional',
                'target_types' => 'JOUEURS',
                'subject' => '🎁 Félicitations ! Vous avez gagné un cadeau',
                'sender_name' => 'EcoloQuiz',
                'sender_email' => 'noreply@ecoloquiz.com',
                'body_html' => '<h1>🎁 Bravo {{prenom}} !</h1>
                    <p>Vous avez gagné un cadeau : <strong>{{gift_name}}</strong></p>
                    <p>{{gift_description}}</p>
                    <p>Pour récupérer votre cadeau, rendez-vous sur votre espace personnel :</p>
                    <p><a href="{{gifts_url}}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Voir mes cadeaux</a></p>
                    <p>Continuez à jouer pour gagner encore plus de récompenses !</p>
                    <p>Félicitations,<br>L\'équipe EcoloQuiz</p>',
                'body_text' => '🎁 Bravo {{prenom}} !

Vous avez gagné un cadeau : {{gift_name}}

{{gift_description}}

Pour récupérer votre cadeau, rendez-vous sur votre espace personnel :
{{gifts_url}}

Continuez à jouer pour gagner encore plus de récompenses !

Félicitations,
L\'équipe EcoloQuiz',
                'variables_schema' => ['prenom', 'nom', 'gift_name', 'gift_description', 'gifts_url'],
                'is_active' => true,
                
            ]);
            $this->command->info('✓ Template GIFT_WON créé');
        }

        // Template pour WELCOME (Bienvenue)
        $welcomeType = EmailType::where('code', 'WELCOME')->first();
        if ($welcomeType && !EmailTemplate::where('email_type_id', $welcomeType->id)->exists()) {
            EmailTemplate::create([
                'name' => 'Email de bienvenue',
                'code' => 'welcome',
                'email_type_id' => $welcomeType->id,
                'type' => 'transactional',
                'target_types' => 'JOUEURS',
                'subject' => 'Bienvenue sur EcoloQuiz !',
                'sender_name' => 'EcoloQuiz',
                'sender_email' => 'noreply@ecoloquiz.com',
                'body_html' => '<h1>Bienvenue sur EcoloQuiz, {{prenom}} !</h1>
                    <p>Votre compte a été validé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités d\'EcoloQuiz.</p>
                    <h2>Commencez votre aventure écologique :</h2>
                    <ul>
                        <li>✅ Répondez à des quiz sur l\'environnement</li>
                        <li>🏆 Gagnez des points et montez de niveau</li>
                        <li>🎁 Débloquez des cadeaux exclusifs</li>
                        <li>🌍 Apprenez tout en vous amusant</li>
                    </ul>
                    <p><a href="{{quiz_url}}" style="background-color: #22c55e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Commencer à jouer</a></p>
                    <p>Bonne chance et amusez-vous bien !<br>L\'équipe EcoloQuiz</p>',
                'body_text' => 'Bienvenue sur EcoloQuiz, {{prenom}} !

Votre compte a été validé avec succès. Vous pouvez maintenant profiter de toutes les fonctionnalités d\'EcoloQuiz.

Commencez votre aventure écologique :
- Répondez à des quiz sur l\'environnement
- Gagnez des points et montez de niveau
- Débloquez des cadeaux exclusifs
- Apprenez tout en vous amusant

Commencer à jouer : {{quiz_url}}

Bonne chance et amusez-vous bien !
L\'équipe EcoloQuiz',
                'variables_schema' => ['prenom', 'nom', 'email', 'quiz_url'],
                'is_active' => true,
                
            ]);
            $this->command->info('✓ Template WELCOME créé');
        }

        $this->command->info('System email templates seeding completed!');
    }
}
