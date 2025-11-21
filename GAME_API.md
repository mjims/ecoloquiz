# API du Jeu Écolo Quiz

## Vue d'ensemble

L'API du jeu est complètement implémentée dans le backend Laravel. Voici un guide complet de tous les endpoints et leur fonctionnement.

## Structure des données

### Thèmes (4 au total)
1. **Déchets et Recyclage** - Apprends les bonnes pratiques de tri et de recyclage
2. **Énergie** - Découvre comment économiser l'énergie au quotidien
3. **Biodiversité** - Explore l'importance de la biodiversité
4. **Consommation responsable** - Adopte des habitudes plus durables

### Niveaux (3 par thème)
1. **Découverte** (niveau 1) - 3 questions
2. **Connaisseur** (niveau 2) - 4 questions
3. **Expert** (niveau 3) - 5 questions

### Système de points
- **Bonne réponse** : +5 points
- **Mauvaise réponse** : -10 points
- **Question passée** : 0 point (la question est marquée comme terminée sans pénalité)

## Endpoints de l'API

### 1. Quiz suggéré
```
GET /api/player/suggested-quiz
Headers: Authorization: Bearer {token}
```
Retourne un quiz suggéré pour commencer à jouer.

**Réponse :**
```json
{
  "quiz": {
    "id": "uuid",
    "title": "Déchets et Recyclage - Découverte",
    "theme_id": "uuid",
    "level_id": 1,
    "theme": {...},
    "level": {...}
  }
}
```

### 2. Progression du joueur
```
GET /api/player/progression
Headers: Authorization: Bearer {token}
```
Retourne les statistiques de progression du joueur.

**Réponse :**
```json
{
  "quizCompleted": 0,
  "levels": [
    {
      "level": 1,
      "name": "Découverte",
      "percentage": 0,
      "stars": 1
    }
  ]
}
```

### 3. Jeu en cours
```
GET /api/player/current-game
Headers: Authorization: Bearer {token}
```
Détecte si le joueur a un jeu en cours et retourne le thème correspondant.

**Réponse :**
```json
{
  "has_game_in_progress": true,
  "theme_id": "uuid",
  "theme_name": "Déchets et Recyclage"
}
```

### 4. Prochaine question
```
GET /api/player/theme/{themeId}/next-question
Headers: Authorization: Bearer {token}
```
Retourne la prochaine question non répondue pour un thème donné.

**Réponse :**
```json
{
  "question": {
    "id": "uuid",
    "text": "Quelle est la première étape du tri des déchets ?",
    "type": "multiple_choice",
    "explanation": "...",
    "options": [
      {
        "id": "uuid",
        "text": "Séparer les matières recyclables",
        "question_id": "uuid"
      }
    ]
  },
  "quiz": {
    "id": "uuid",
    "title": "Déchets et Recyclage - Découverte"
  },
  "theme": {...},
  "level": {...},
  "progress": {
    "answered": 0,
    "total": 3,
    "percentage": 0
  }
}
```

**Note importante :** Le champ `is_correct` n'est PAS inclus dans les options de réponse pour ne pas révéler la bonne réponse.

### 5. Valider une réponse
```
POST /api/player/quiz/{quizId}/validate-answer
Headers: Authorization: Bearer {token}
Content-Type: application/json
```

**Corps de la requête :**
```json
{
  "question_id": "uuid",
  "answer_id": "uuid"  // ou null pour passer la question
}
```

**Réponse :**
```json
{
  "is_correct": true,
  "points_earned": 5,
  "correct_answer_id": "uuid",
  "correct_answer_text": "Séparer les matières recyclables",
  "explanation": "Avant toute chose, il faut séparer les matériaux recyclables...",
  "new_total_points": 5
}
```

## Fonctionnalités clés

### Ordre stable des réponses
Les réponses sont TOUJOURS affichées dans le même ordre (l'ordre de création en base de données). Aucun mélange aléatoire n'est appliqué, ni côté backend ni côté frontend.

### Bouton "Passer"
Le bouton "Passer" permet de passer une question sans y répondre :
- Aucun point gagné ou perdu (ni +5 ni -10)
- La question est marquée comme terminée
- Le joueur passe à la question suivante

### Progression par niveau
Le joueur avance question par question dans chaque niveau :
1. Commence au niveau 1 (Découverte)
2. Répond à toutes les questions du niveau
3. Passe automatiquement au niveau suivant
4. Continue jusqu'à compléter les 3 niveaux d'un thème

### Bouton "Continuer"
Dans le dashboard, un bouton "Continuer" apparaît si le joueur a un jeu en cours :
- Détecte automatiquement le dernier thème joué
- Vérifie s'il reste des questions non répondues
- Redirige directement vers le thème pour reprendre où on s'est arrêté

## Installation et seeders

### Ordre d'exécution des seeders
```bash
php artisan db:seed
```

Les seeders s'exécutent dans cet ordre :
1. `RolesPermissionsSeeder` - Crée les rôles et permissions
2. `AdminUsersSeeder` - Crée les utilisateurs admin
3. `LevelsSeeder` - Crée les 3 niveaux de difficulté
4. `ThemesSeeder` - Crée les 4 thèmes
5. `QuizQuestionsSeeder` - Crée tous les quiz et questions

### Réinitialiser la base de données
```bash
php artisan migrate:fresh --seed
```

## Modèles de données

### Theme
- `id` (UUID)
- `title` (string)
- `description` (text)

### Level
- `id` (integer)
- `name` (string) - "Découverte", "Connaisseur", "Expert"
- `slug` (string) - "decouverte", "connaisseur", "expert"
- `order` (integer) - 1, 2, 3

### Quiz
- `id` (UUID)
- `theme_id` (UUID)
- `level_id` (integer)
- `title` (string)
- `max_score` (integer)

### Question
- `id` (UUID)
- `quiz_id` (UUID)
- `text` (string)
- `type` (string) - "multiple_choice"
- `explanation` (text)

### AnswerOption
- `id` (UUID)
- `question_id` (UUID)
- `text` (string)
- `is_correct` (boolean)

### Player
- `id` (UUID)
- `user_id` (UUID)
- `points` (integer)
- `current_level` (string)
- `last_played` (datetime)

### PlayerAnswer
- `id` (UUID)
- `player_id` (UUID)
- `question_id` (UUID)
- `answer_id` (UUID, nullable)
- `is_correct` (boolean)
- `points_earned` (integer)
- `answered_at` (datetime)

## Authentification

Tous les endpoints du jeu nécessitent une authentification JWT :
```
Authorization: Bearer {access_token}
```

Le token est obtenu via les endpoints d'authentification :
- `POST /api/auth/login`
- `POST /api/auth/register`
