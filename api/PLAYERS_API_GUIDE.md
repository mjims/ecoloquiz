# Guide API Players - Documentation

## 📚 Endpoints Players disponibles

La documentation Swagger pour les joueurs a été mise en place avec succès ! Voici les endpoints disponibles :

### 1. GET /api/players - Liste paginée des joueurs 🔒

Récupère une liste paginée de tous les joueurs avec leurs informations utilisateur, zone et statistiques.

**Authentification requise** : Oui (JWT Bearer token)

#### Paramètres de requête (Query Parameters)

| Paramètre | Type | Requis | Description | Exemple |
|-----------|------|--------|-------------|---------|
| `page` | integer | Non | Numéro de page | `1` |
| `per_page` | integer | Non | Nombre d'éléments par page (max 100) | `15` |
| `sort_by` | string | Non | Champ de tri (`points`, `created_at`, `last_played`) | `points` |
| `sort_order` | string | Non | Ordre de tri (`asc`, `desc`) | `desc` |
| `level` | string | Non | Filtrer par niveau actuel | `DECOUVERTE` |
| `zone_id` | uuid | Non | Filtrer par ID de zone | `uuid-here` |

#### Exemple de requête

```bash
GET /api/players?page=1&per_page=20&sort_by=points&sort_order=desc&level=DECOUVERTE
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

#### Exemple de réponse (200 OK)

```json
{
  "current_page": 1,
  "data": [
    {
      "id": "uuid-here",
      "user_id": "uuid-here",
      "points": 150,
      "current_level": "DECOUVERTE",
      "last_played": "2025-11-13T20:00:00.000000Z",
      "zone_id": "uuid-here",
      "created_at": "2025-11-01T10:00:00.000000Z",
      "updated_at": "2025-11-13T20:00:00.000000Z",
      "user": {
        "id": "uuid-here",
        "email": "player@example.com",
        "first_name": "John",
        "last_name": "Doe",
        "status": "ACTIVE"
      },
      "zone": {
        "id": "uuid-here",
        "name": "Zone Nord",
        "code": "ZN01"
      }
    }
  ],
  "first_page_url": "http://localhost:8000/api/players?page=1",
  "from": 1,
  "last_page": 5,
  "last_page_url": "http://localhost:8000/api/players?page=5",
  "links": [
    {
      "url": null,
      "label": "&laquo; Previous",
      "active": false
    },
    {
      "url": "http://localhost:8000/api/players?page=1",
      "label": "1",
      "active": true
    },
    {
      "url": "http://localhost:8000/api/players?page=2",
      "label": "2",
      "active": false
    }
  ],
  "next_page_url": "http://localhost:8000/api/players?page=2",
  "path": "http://localhost:8000/api/players",
  "per_page": 15,
  "prev_page_url": null,
  "to": 15,
  "total": 67
}
```

### 2. GET /api/players/{id} - Détails d'un joueur 🔒

Récupère les informations détaillées d'un joueur spécifique.

**Authentification requise** : Oui (JWT Bearer token)

#### Paramètres de chemin (Path Parameters)

| Paramètre | Type | Requis | Description |
|-----------|------|--------|-------------|
| `id` | uuid | Oui | ID du joueur |

#### Exemple de requête

```bash
GET /api/players/550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

#### Exemple de réponse (200 OK)

```json
{
  "player": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "user_id": "uuid-here",
    "points": 150,
    "current_level": "DECOUVERTE",
    "last_played": "2025-11-13T20:00:00.000000Z",
    "zone_id": "uuid-here",
    "created_at": "2025-11-01T10:00:00.000000Z",
    "updated_at": "2025-11-13T20:00:00.000000Z",
    "user": {
      "id": "uuid-here",
      "email": "player@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "status": "ACTIVE"
    },
    "zone": {
      "id": "uuid-here",
      "name": "Zone Nord",
      "code": "ZN01"
    },
    "allocations": []
  }
}
```

#### Codes de réponse

| Code | Description |
|------|-------------|
| 200 | Joueur récupéré avec succès |
| 401 | Non authentifié (token manquant ou invalide) |
| 404 | Joueur non trouvé |

---

## 🚀 Exemples d'utilisation

### Exemple 1 : Récupérer les 10 meilleurs joueurs

```bash
GET /api/players?per_page=10&sort_by=points&sort_order=desc
Authorization: Bearer YOUR_TOKEN
```

### Exemple 2 : Filtrer les joueurs par niveau

```bash
GET /api/players?level=DECOUVERTE&per_page=20
Authorization: Bearer YOUR_TOKEN
```

### Exemple 3 : Récupérer les joueurs d'une zone spécifique

```bash
GET /api/players?zone_id=550e8400-e29b-41d4-a716-446655440000
Authorization: Bearer YOUR_TOKEN
```

### Exemple 4 : Pagination - Page 2 avec 25 éléments

```bash
GET /api/players?page=2&per_page=25
Authorization: Bearer YOUR_TOKEN
```

### Exemple 5 : Trier par dernière activité

```bash
GET /api/players?sort_by=last_played&sort_order=desc
Authorization: Bearer YOUR_TOKEN
```

---

## 🔐 Authentification

Tous les endpoints Players nécessitent une authentification JWT. Voici comment procéder :

### 1. Obtenir un token

Utilisez l'endpoint de login ou register :

```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "player@example.com",
  "password": "password123"
}
```

**Réponse :**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### 2. Utiliser le token

Incluez le token dans l'en-tête Authorization de vos requêtes :

```bash
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

---

## 📊 Structure de la réponse paginée

La pagination Laravel retourne une structure standard :

```json
{
  "current_page": 1,        // Page actuelle
  "data": [...],            // Tableau des joueurs
  "first_page_url": "...",  // URL de la première page
  "from": 1,                // Index du premier élément
  "last_page": 5,           // Numéro de la dernière page
  "last_page_url": "...",   // URL de la dernière page
  "links": [...],           // Liens de navigation
  "next_page_url": "...",   // URL de la page suivante (null si dernière page)
  "path": "...",            // Chemin de base
  "per_page": 15,           // Nombre d'éléments par page
  "prev_page_url": null,    // URL de la page précédente (null si première page)
  "to": 15,                 // Index du dernier élément
  "total": 67               // Nombre total d'éléments
}
```

---

## 🧪 Tester avec Swagger UI

1. Accédez à l'interface Swagger :
   ```
   http://localhost:8000/api/documentation
   ```

2. Authentifiez-vous :
   - Cliquez sur "Authorize" 🔓
   - Entrez : `Bearer VOTRE_TOKEN`
   - Cliquez sur "Authorize" puis "Close"

3. Testez les endpoints Players :
   - Développez la section "Players"
   - Cliquez sur un endpoint
   - Cliquez sur "Try it out"
   - Remplissez les paramètres (optionnels)
   - Cliquez sur "Execute"

---

## 💡 Bonnes pratiques

### Pagination
- ✅ Utilisez toujours la pagination pour les grandes listes
- ✅ Limitez `per_page` à un maximum de 100 éléments
- ✅ Utilisez les liens `next_page_url` et `prev_page_url` pour la navigation

### Filtrage
- ✅ Combinez plusieurs filtres pour des résultats précis
- ✅ Utilisez `sort_by` et `sort_order` pour organiser les résultats
- ✅ Filtrez par `level` pour segmenter les joueurs

### Performance
- ✅ Les relations (user, zone) sont chargées automatiquement (eager loading)
- ✅ Seuls les champs nécessaires sont retournés pour optimiser la bande passante
- ✅ Utilisez des index appropriés sur les champs de filtrage

### Sécurité
- ✅ Toujours inclure le token JWT dans les requêtes
- ✅ Vérifiez la validité du token (expires_in)
- ✅ Rafraîchissez le token si nécessaire avec `/api/auth/refresh`

---

## 🔄 Intégration Frontend

### Exemple avec Axios (JavaScript)

```javascript
// Configuration de base
const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('token')}`,
    'Content-Type': 'application/json'
  }
});

// Récupérer la liste des joueurs
async function getPlayers(page = 1, perPage = 15) {
  try {
    const response = await api.get('/players', {
      params: {
        page,
        per_page: perPage,
        sort_by: 'points',
        sort_order: 'desc'
      }
    });
    return response.data;
  } catch (error) {
    console.error('Erreur:', error.response.data);
  }
}

// Récupérer un joueur spécifique
async function getPlayer(playerId) {
  try {
    const response = await api.get(`/players/${playerId}`);
    return response.data.player;
  } catch (error) {
    console.error('Erreur:', error.response.data);
  }
}

// Utilisation
const players = await getPlayers(1, 20);
console.log(`Total: ${players.total} joueurs`);
console.log(`Page ${players.current_page} sur ${players.last_page}`);
```

### Exemple avec Fetch (JavaScript)

```javascript
// Récupérer la liste des joueurs
async function getPlayers() {
  const token = localStorage.getItem('token');
  const response = await fetch('http://localhost:8000/api/players?per_page=20', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  if (!response.ok) {
    throw new Error('Erreur lors de la récupération des joueurs');
  }
  
  return await response.json();
}
```

---

## 📝 Notes importantes

1. **Validation** : Tous les paramètres sont validés côté serveur
2. **Soft Deletes** : Les joueurs supprimés ne sont pas retournés par défaut
3. **Relations** : Les relations user et zone sont automatiquement chargées
4. **UUID** : Tous les IDs utilisent le format UUID v4
5. **Timestamps** : Les dates sont au format ISO 8601 (UTC)

---

**Documentation créée le :** 13/11/2025  
**Version de l'API :** 1.0.0  
**Endpoints documentés :** 2 (GET /api/players, GET /api/players/{id})
