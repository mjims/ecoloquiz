# Docker Configuration Guide - EcoloQuiz

Ce guide explique comment lancer l'application EcoloQuiz avec Docker.

## Prérequis

- Docker installé (version 20.10+)
- Docker Compose installé (version 2.0+)

## Architecture

L'application est composée de 4 services:
- **db**: Base de données MySQL 8.0
- **api**: Backend Laravel (port 8000)
- **frontoffice**: Interface utilisateur Next.js (port 3000)
- **backoffice**: Interface administrateur Next.js (port 3001)

## Configuration Initiale

### 1. Fichier d'environnement

Créez un fichier `.env` à la racine du projet (si pas déjà présent):

```bash
# Application
APP_NAME=EcoloQuiz
APP_ENV=local
APP_KEY=base64:YOUR_KEY_HERE
APP_DEBUG=true
APP_URL=http://localhost:8000

# Database
DB_CONNECTION=mysql
DB_HOST=db
DB_PORT=3306
DB_DATABASE=ecoloquiz
DB_USERNAME=ecoloquiz
DB_PASSWORD=secret

# Email (Brevo)
BREVO_API_KEY=
BREVO_SENDER_EMAIL=
BREVO_SENDER_NAME=
```

> **Note**: L'`APP_KEY` sera généré automatiquement au premier lancement si absent ou invalide.

### 2. Créer le fichier `.env` pour l'API

Copiez le fichier d'environnement:
```bash
cp api/.env.example api/.env
```

Mettez à jour les valeurs pour correspondre à la configuration Docker.

## Lancement de l'application

### Première fois (Build complet)

```bash
# Build tous les services
docker-compose build --no-cache

# Lancer les services
docker-compose up -d

# Voir les logs
docker-compose logs -f
```

### Lancements suivants

```bash
# Lancer les services
docker-compose up -d

# Arrêter les services
docker-compose down

# Arrêter et supprimer les volumes (⚠️ supprime les données)
docker-compose down -v
```

## Vérification

Une fois les services lancés, vérifiez qu'ils fonctionnent:

```bash
# Vérifier le statut des conteneurs
docker-compose ps

# Tester l'API
curl http://localhost:8000/api/health

# Accéder aux applications
# - API: http://localhost:8000
# - Frontoffice: http://localhost:3000
# - Backoffice: http://localhost:3001
```

## Commandes Utiles

### Logs

```bash
# Tous les services
docker-compose logs -f

# Un service spécifique
docker-compose logs -f api
docker-compose logs -f frontoffice
docker-compose logs -f backoffice
```

### Exécuter des commandes dans les conteneurs

```bash
# Commandes Laravel
docker-compose exec api php artisan migrate
docker-compose exec api php artisan db:seed
docker-compose exec api php artisan cache:clear

# Accéder à la base de données
docker-compose exec db mysql -u ecoloquiz -p ecoloquiz
```

### Rebuild un service spécifique

```bash
docker-compose build api
docker-compose build frontoffice
docker-compose build backoffice
```

### Redémarrer un service

```bash
docker-compose restart api
docker-compose restart frontoffice
docker-compose restart backoffice
```

## Troubleshooting

### Les services ne démarrent pas

1. Vérifiez les logs:
   ```bash
   docker-compose logs
   ```

2. Vérifiez que les ports ne sont pas déjà utilisés:
   ```bash
   lsof -i :3000
   lsof -i :3001
   lsof -i :8000
   ```

### L'API ne se connecte pas à la base de données

1. Vérifiez que la base de données est lancée:
   ```bash
   docker-compose ps db
   ```

2. Vérifiez les credentials dans le `.env`:
   - `DB_HOST=db` (nom du service Docker, pas localhosts)
   - `DB_USERNAME` et `DB_PASSWORD` doivent correspondre

### Les services frontend ne peuvent pas contacter l'API

- Pendant le **build**: L'URL est `http://api:80/api` (communication entre conteneurs)
- Depuis le **navigateur**: L'URL est `http://localhost:8000/api`

C'est normal! Next.js utilise l'URL interne pendant le build (Server Side Rendering) mais l'URL externe est utilisée par le navigateur (Client Side).

### Erreur "APP_KEY not set"

Le script d'entrée devrait générer automatiquement la clé. Si ce n'est pas le cas:

```bash
docker-compose exec api php artisan key:generate
```

### Rebuild complet (dernier recours)

```bash
# Arrêter et supprimer tout
docker-compose down -v

# Supprimer les images
docker-compose rm -f

# Rebuild from scratch
docker-compose build --no-cache

# Relancer
docker-compose up -d
```

## Développement

### Mode developpement avec hot-reload

Pour le développement, vous pourriez préférer lancer les services Next.js en local:

```bash
# Lancer uniquement DB et API
docker-compose up -d db api

# Dans un autre terminal - Frontoffice
cd frontoffice
npm run dev

# Dans un autre terminal - Backoffice
cd backoffice
npm run dev
```

N'oubliez pas de mettre à jour les URLs dans vos fichiers `.env.local`:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Production

Pour la production, utilisez le fichier `docker-compose.prod.yml`:

```bash
docker-compose -f docker-compose.prod.yml up -d
```

Assurez-vous d'avoir configuré les variables d'environnement appropriées pour la production.
