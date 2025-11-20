# Guide de Documentation Swagger - Authentification

## 📚 Documentation générée avec succès !

La documentation Swagger pour l'authentification a été mise en place avec tous les endpoints suivants :

### Endpoints d'authentification documentés :

1. **POST /api/auth/register** - Inscription d'un nouveau joueur
   - Crée un compte utilisateur et un profil joueur
   - Retourne un token JWT
   - Paramètres : email, password, first_name (optionnel), last_name (optionnel)

2. **POST /api/auth/login** - Connexion
   - Authentifie l'utilisateur
   - Retourne un token JWT
   - Paramètres : email, password

3. **GET /api/auth/me** - Obtenir l'utilisateur actuel
   - Retourne les informations de l'utilisateur connecté avec ses rôles et profil joueur
   - Nécessite un token JWT (🔒 Protégé)

4. **POST /api/auth/logout** - Déconnexion
   - Invalide le token JWT actuel
   - Nécessite un token JWT (🔒 Protégé)

5. **POST /api/auth/refresh** - Rafraîchir le token
   - Invalide l'ancien token et retourne un nouveau
   - Nécessite un token JWT (🔒 Protégé)

## 🚀 Accéder à la documentation

### Option 1 : Interface Swagger UI
Accédez à l'interface Swagger UI via votre navigateur :
```
http://localhost:8000/api/documentation
```

### Option 2 : Fichier JSON
Le fichier de documentation JSON est disponible à :
```
storage/api-docs/api-docs.json
```

## 🔐 Utiliser l'authentification dans Swagger UI

1. **Tester un endpoint public** (register ou login) :
   - Cliquez sur l'endpoint
   - Cliquez sur "Try it out"
   - Remplissez les paramètres
   - Cliquez sur "Execute"
   - Copiez le `access_token` de la réponse

2. **Autoriser les requêtes protégées** :
   - Cliquez sur le bouton "Authorize" 🔓 en haut de la page
   - Dans le champ "Value", entrez : `Bearer VOTRE_TOKEN`
   - Cliquez sur "Authorize"
   - Cliquez sur "Close"

3. **Tester les endpoints protégés** :
   - Maintenant vous pouvez tester /api/auth/me, /api/auth/logout, etc.
   - Le token sera automatiquement inclus dans les requêtes

## 📝 Exemple de flux complet

### 1. Inscription
```bash
POST /api/auth/register
{
  "email": "player@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "first_name": "John",
  "last_name": "Doe"
}
```

**Réponse :**
```json
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600,
  "user": {
    "id": "uuid-here",
    "email": "player@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "ACTIVE"
  }
}
```

### 2. Connexion
```bash
POST /api/auth/login
{
  "email": "player@example.com",
  "password": "password123"
}
```

### 3. Obtenir le profil (avec token)
```bash
GET /api/auth/me
Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGc...
```

**Réponse :**
```json
{
  "user": {
    "id": "uuid-here",
    "email": "player@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "status": "ACTIVE",
    "roles": [],
    "player": {
      "id": "uuid-here",
      "points": 0,
      "current_level": "DECOUVERTE"
    }
  }
}
```

## 🔄 Régénérer la documentation

Si vous modifiez les annotations Swagger, régénérez la documentation avec :
```bash
php artisan l5-swagger:generate
```

## ⚙️ Configuration

### SecurityScheme configuré :
- **Type** : HTTP Bearer
- **Format** : JWT
- **Header** : Authorization
- **Schéma** : Bearer {token}

### Endpoints protégés
Les endpoints marqués avec `security={{"token":{}}}` nécessitent un token JWT valide.

## 📋 Prochaines étapes

Pour ajouter la documentation d'autres contrôleurs :
1. Ajoutez les annotations `@OA\` dans vos méthodes de contrôleur
2. Utilisez `security={{"token":{}}}` pour les endpoints protégés
3. Régénérez la documentation avec `php artisan l5-swagger:generate`

## 🎯 Bonnes pratiques

- ✅ Toujours documenter les paramètres requis et optionnels
- ✅ Fournir des exemples de valeurs
- ✅ Documenter tous les codes de réponse possibles (200, 401, 422, 500, etc.)
- ✅ Utiliser des descriptions claires et concises
- ✅ Marquer correctement les endpoints protégés avec `security`

---

**Documentation créée le :** 13/11/2025
**Version de l'API :** 1.0.0
