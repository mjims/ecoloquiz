<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class PermissionSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            // Gestion des utilisateurs
            ['name' => 'users.view', 'description' => 'Voir les utilisateurs'],
            ['name' => 'users.create', 'description' => 'Créer des utilisateurs'],
            ['name' => 'users.edit', 'description' => 'Modifier des utilisateurs'],
            ['name' => 'users.delete', 'description' => 'Supprimer des utilisateurs'],

            // Gestion des quiz
            ['name' => 'quizzes.view', 'description' => 'Voir les quiz'],
            ['name' => 'quizzes.create', 'description' => 'Créer des quiz'],
            ['name' => 'quizzes.edit', 'description' => 'Modifier des quiz'],
            ['name' => 'quizzes.delete', 'description' => 'Supprimer des quiz'],

            // Gestion des questions
            ['name' => 'questions.view', 'description' => 'Voir les questions'],
            ['name' => 'questions.create', 'description' => 'Créer des questions'],
            ['name' => 'questions.edit', 'description' => 'Modifier des questions'],
            ['name' => 'questions.delete', 'description' => 'Supprimer des questions'],

            // Gestion des thèmes
            ['name' => 'themes.view', 'description' => 'Voir les thèmes'],
            ['name' => 'themes.create', 'description' => 'Créer des thèmes'],
            ['name' => 'themes.edit', 'description' => 'Modifier des thèmes'],
            ['name' => 'themes.delete', 'description' => 'Supprimer des thèmes'],

            // Gestion des zones
            ['name' => 'zones.view', 'description' => 'Voir les zones'],
            ['name' => 'zones.create', 'description' => 'Créer des zones'],
            ['name' => 'zones.edit', 'description' => 'Modifier des zones'],
            ['name' => 'zones.delete', 'description' => 'Supprimer des zones'],

            // Gestion des entreprises
            ['name' => 'companies.view', 'description' => 'Voir les entreprises'],
            ['name' => 'companies.create', 'description' => 'Créer des entreprises'],
            ['name' => 'companies.edit', 'description' => 'Modifier des entreprises'],
            ['name' => 'companies.delete', 'description' => 'Supprimer des entreprises'],

            // Gestion des cadeaux
            ['name' => 'gifts.view', 'description' => 'Voir les cadeaux'],
            ['name' => 'gifts.create', 'description' => 'Créer des cadeaux'],
            ['name' => 'gifts.edit', 'description' => 'Modifier des cadeaux'],
            ['name' => 'gifts.delete', 'description' => 'Supprimer des cadeaux'],
            ['name' => 'gifts.allocate', 'description' => 'Allouer des cadeaux'],

            // Gestion des pages/CMS
            ['name' => 'pages.view', 'description' => 'Voir les pages'],
            ['name' => 'pages.create', 'description' => 'Créer des pages'],
            ['name' => 'pages.edit', 'description' => 'Modifier des pages'],
            ['name' => 'pages.delete', 'description' => 'Supprimer des pages'],
            ['name' => 'pages.publish', 'description' => 'Publier des pages'],

            // Gestion des campagnes email
            ['name' => 'campaigns.view', 'description' => 'Voir les campagnes'],
            ['name' => 'campaigns.create', 'description' => 'Créer des campagnes'],
            ['name' => 'campaigns.edit', 'description' => 'Modifier des campagnes'],
            ['name' => 'campaigns.delete', 'description' => 'Supprimer des campagnes'],
            ['name' => 'campaigns.send', 'description' => 'Envoyer des campagnes'],

            // Gestion des templates email
            ['name' => 'email_templates.view', 'description' => 'Voir les templates email'],
            ['name' => 'email_templates.create', 'description' => 'Créer des templates email'],
            ['name' => 'email_templates.edit', 'description' => 'Modifier des templates email'],
            ['name' => 'email_templates.delete', 'description' => 'Supprimer des templates email'],

            // Statistiques
            ['name' => 'statistics.view', 'description' => 'Voir les statistiques'],
            ['name' => 'statistics.export', 'description' => 'Exporter les statistiques'],

            // Rôles et permissions
            ['name' => 'roles.view', 'description' => 'Voir les rôles'],
            ['name' => 'roles.create', 'description' => 'Créer des rôles'],
            ['name' => 'roles.edit', 'description' => 'Modifier des rôles'],
            ['name' => 'roles.delete', 'description' => 'Supprimer des rôles'],
            ['name' => 'permissions.view', 'description' => 'Voir les permissions'],
            ['name' => 'permissions.create', 'description' => 'Créer des permissions'],
            ['name' => 'permissions.edit', 'description' => 'Modifier des permissions'],
            ['name' => 'permissions.delete', 'description' => 'Supprimer des permissions'],

            // Gestion des joueurs (players)
            ['name' => 'players.view', 'description' => 'Voir les joueurs'],
            ['name' => 'players.disable', 'description' => 'Désactiver des joueurs'],
            ['name' => 'players.delete', 'description' => 'Supprimer des joueurs'],

            // Gestion avancée des utilisateurs admin
            ['name' => 'admin_users.manage', 'description' => 'Gérer les utilisateurs admin'],
            ['name' => 'admin_users.update_password', 'description' => 'Modifier les mots de passe admin'],
        ];

        foreach ($permissions as &$permission) {
            $permission['id'] = Str::uuid();
            $permission['created_at'] = now();
            $permission['updated_at'] = now();
        }

        DB::table('permissions')->insert($permissions);
    }
}
