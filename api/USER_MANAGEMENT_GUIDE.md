# Guide de Gestion des Utilisateurs - EcoloQuiz API

## Vue d'ensemble

Ce guide décrit le système de gestion des utilisateurs mis en place dans l'API EcoloQuiz, incluant les permissions, les rôles et les différentes opérations disponibles.

## Architecture

### Modèles

- **User** : Modèle principal des utilisateurs
- **Role** : Rôles attribués aux utilisateurs
- **Permission** : Permissions granulaires pour contrôler l'accès
- **Player** : Extension du modèle User pour les joueurs

### Relations

- Un utilisateur peut avoir plusieurs rôles (many-to-many)
- Un rôle peut avoir plusieurs permissions (many-to-many)
- Un utilisateur peut avoir un profil joueur (one-to-one)

## Permissions

### Permissions pour la gestion des joueurs

- `players.view` : Voir les joueurs
- `players.disable` : Désactiver des joueurs
- `players.delete` : Supprimer des joueurs

### Permissions pour la gestion des utilisateurs admin

- `admin_users.manage` : Gérer les utilisateurs admin (modification, suppression)
- `admin_users.update_password` : Modifier les mots de passe des utilisateurs admin

### Autres permissions

Voir le fichier `database/seeders/PermissionSeeder.php` pour la liste complète des permissions disponibles.

## Règles de gestion

### 1. Gestion des joueurs

#### Un admin peut :
- **Désactiver** un compte joueur (avec permission `players.disable`)
- **Supprimer** un compte joueur (avec permission `players.delete`)
- **Modifier** les informations d'un joueur (avec permission `users.edit` ou `players.disable`)

#### Un joueur peut :
- **Mettre à jour** ses propres informations
- **Supprimer** son propre compte
- **Changer** son propre mot de passe

### 2. Gestion des utilisateurs admin

#### Un admin peut :
- **Supprimer** un autre compte admin (avec permission `admin_users.manage`)
- **Modifier** les attributs d'un autre compte admin (avec permission `admin_users.manage`)
- **Changer le mot de passe** d'un autre admin (avec permission `admin_users.update_password`)

**Note** : Un admin ne peut PAS changer le mot de passe d'un joueur pour des raisons de sécurité.

## Endpoints API

### 1. Obtenir les informations de l'utilisateur connecté

```http
GET /api/users/me
Authorization: Bearer {token}
```

**Réponse** :
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "active",
    "roles": [...],
    "player": {...}
  }
}
```

### 2. Mettre à jour un utilisateur

```http
PUT /api/users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean.dupont@example.com",
  "status": "active",
  "meta": {
    "phone": "0123456789"
  }
}
```

**Permissions requises** :
- Utilisateur lui-même : aucune permission requise
- Pour modifier un joueur : `players.disable` ou `users.edit`
- Pour modifier un admin : `admin_users.manage`

**Réponse** :
```json
{
  "message": "Utilisateur mis à jour avec succès",
  "user": {...}
}
```

### 3. Mettre à jour le mot de passe

```http
PUT /api/users/{id}/password
Authorization: Bearer {token}
Content-Type: application/json

{
  "password": "newpassword123",
  "password_confirmation": "newpassword123"
}
```

**Permissions requises** :
- Utilisateur lui-même : aucune permission requise
- Pour un autre admin : `admin_users.update_password`
- Pour un joueur : **INTERDIT** (retourne 403)

**Réponse** :
```json
{
  "message": "Mot de passe mis à jour avec succès"
}
```

### 4. Désactiver un utilisateur (joueur uniquement)

```http
PUT /api/users/{id}/disable
Authorization: Bearer {token}
```

**Permissions requises** : `players.disable`

**Réponse** :
```json
{
  "message": "Utilisateur désactivé avec succès"
}
```

### 5. Supprimer un utilisateur

```http
DELETE /api/users/{id}
Authorization: Bearer {token}
```

**Permissions requises** :
- Utilisateur lui-même : aucune permission requise
- Pour supprimer un joueur : `players.delete`
- Pour supprimer un admin : `admin_users.manage`

**Réponse** :
```json
{
  "message": "Utilisateur supprimé avec succès"
}
```

## Méthodes utilitaires du modèle User

Le modèle `User` dispose de plusieurs méthodes helper pour faciliter la gestion des permissions :

```php
// Vérifier si l'utilisateur a un rôle spécifique
$user->hasRole('superadmin');
$user->hasRole(['superadmin', 'partner_mayor']);

// Vérifier si l'utilisateur a une permission
$user->hasPermission('players.delete');

// Vérifier si l'utilisateur est un joueur
$user->isPlayer();

// Vérifier si l'utilisateur est un admin
$user->isAdmin();
```

## Codes d'erreur

- **403 Forbidden** : L'utilisateur n'a pas les permissions nécessaires
- **404 Not Found** : L'utilisateur demandé n'existe pas
- **400 Bad Request** : Requête invalide (ex: tentative de désactiver un admin via la route de désactivation)
- **422 Unprocessable Entity** : Erreurs de validation

## Exemples d'utilisation

### Exemple 1 : Un joueur met à jour ses informations

```bash
curl -X PUT http://localhost:8000/api/users/{user_id} \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "first_name": "Marie",
    "last_name": "Martin",
    "email": "marie.martin@example.com"
  }'
```

### Exemple 2 : Un admin désactive un compte joueur

```bash
curl -X PUT http://localhost:8000/api/users/{player_id}/disable \
  -H "Authorization: Bearer {admin_token}"
```

### Exemple 3 : Un admin change le mot de passe d'un autre admin

```bash
curl -X PUT http://localhost:8000/api/users/{admin_id}/password \
  -H "Authorization: Bearer {admin_token}" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "newSecurePassword123",
    "password_confirmation": "newSecurePassword123"
  }'
```

### Exemple 4 : Un joueur supprime son compte

```bash
curl -X DELETE http://localhost:8000/api/users/{user_id} \
  -H "Authorization: Bearer {token}"
```

## Sécurité

### Bonnes pratiques

1. **Validation des permissions** : Toutes les routes vérifient les permissions avant d'effectuer une action
2. **Isolation des joueurs** : Les admins ne peuvent pas modifier les mots de passe des joueurs
3. **Auto-gestion** : Les utilisateurs peuvent toujours gérer leur propre compte
4. **Transactions** : Les suppressions utilisent des transactions pour garantir l'intégrité des données
5. **Soft deletes** : Les modèles utilisent le soft delete pour permettre une récupération si nécessaire

### Recommandations

- Toujours utiliser HTTPS en production
- Implémenter un rate limiting sur les endpoints sensibles
- Logger toutes les actions de gestion des utilisateurs
- Mettre en place une politique de mots de passe forts
- Activer la vérification email pour les nouveaux comptes

## Tests

Pour tester les fonctionnalités, vous pouvez utiliser les tests Pest :

```bash
# Exécuter tous les tests
php artisan test

# Exécuter les tests d'un fichier spécifique
php artisan test tests/Feature/UserManagementTest.php

# Exécuter un test spécifique
php artisan test --filter=test_admin_can_disable_player
```

## Swagger/OpenAPI

La documentation Swagger est disponible et inclut tous les endpoints de gestion des utilisateurs. Pour y accéder :

```bash
# Générer la documentation
php artisan l5-swagger:generate

# Accéder à la documentation
http://localhost:8000/api/documentation
```

## Support

Pour toute question ou problème, veuillez consulter :
- La documentation Swagger : `/api/documentation`
- Le code source : `app/Http/Controllers/Api/UserManagementController.php`
