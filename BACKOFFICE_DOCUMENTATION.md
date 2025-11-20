# Documentation Backoffice - EcoloQuiz

Ce document décrit l'architecture et les fonctionnalités du backoffice d'administration EcoloQuiz.

## Vue d'ensemble

Le backoffice est une application Next.js 16 avec App Router qui permet aux administrateurs de gérer l'application EcoloQuiz. Il utilise une authentification JWT via l'API Laravel.

## Architecture

### Structure des fichiers

```
backoffice/app/
├── (auth)/                      # Routes d'authentification (non protégées)
│   └── login/
│       └── page.tsx            # Page de connexion admin
├── (admin)/                     # Routes protégées (nécessitent authentification)
│   ├── layout.tsx              # Layout avec navbar et protection de route
│   ├── abonnes/
│   │   └── page.tsx            # Gestion des joueurs/abonnés
│   ├── questions/
│   │   └── page.tsx            # Gestion des questions
│   ├── zones/
│   │   └── page.tsx            # Gestion des zones
│   ├── cadeaux/
│   │   └── page.tsx            # Gestion des cadeaux
│   ├── stats/
│   │   └── page.tsx            # Statistiques
│   ├── communication/
│   │   └── page.tsx            # Communication
│   └── utilisateurs/
│       └── page.tsx            # Gestion des utilisateurs admin
├── components/
│   ├── common/                 # Composants réutilisables
│   │   ├── Input.tsx
│   │   └── Button.tsx
│   └── layout/                 # Composants de layout
│       └── Navbar.tsx          # Barre de navigation supérieure
├── lib/
│   ├── api-client.ts           # Client API avec endpoints
│   └── storage.ts              # Gestion localStorage
├── context/
│   └── AuthContext.tsx         # Contexte d'authentification
├── layout.tsx                  # Layout racine avec AuthProvider
└── globals.css                 # Styles globaux
```

## Fonctionnalités implémentées

### 1. Menu de navigation supérieur

**Composant** : [Navbar.tsx](backoffice/app/components/layout/Navbar.tsx)

**Caractéristiques** :
- Logo EcoloQuiz avec icône
- Menu horizontal avec 7 sections :
  - Abonnés
  - Questions
  - Zones
  - Cadeaux
  - Stats
  - Communication
  - Utilisateurs
- Affichage du nom et email de l'administrateur connecté
- Bouton de déconnexion
- Responsive : menu mobile pour petits écrans
- Indication visuelle de la page active

**Navigation** :
```typescript
const navItems = [
  { label: 'Abonnés', href: '/abonnes' },
  { label: 'Questions', href: '/questions' },
  { label: 'Zones', href: '/zones' },
  { label: 'Cadeaux', href: '/cadeaux' },
  { label: 'Stats', href: '/stats' },
  { label: 'Communication', href: '/communication' },
  { label: 'Utilisateurs', href: '/utilisateurs' },
];
```

### 2. Layout protégé

**Fichier** : [(admin)/layout.tsx](backoffice/app/(admin)/layout.tsx)

**Protection de route** :
- Vérifie l'authentification au chargement
- Redirige vers `/login` si non authentifié
- Affiche un loader pendant la vérification
- Inclut automatiquement la Navbar sur toutes les pages admin

### 3. Page de gestion des Abonnés

**Route** : `/abonnes`
**Fichier** : [(admin)/abonnes/page.tsx](backoffice/app/(admin)/abonnes/page.tsx)

**Caractéristiques** :
- Tableau avec scroll horizontal en cas d'overflow
- Affichage sur une seule ligne (comme demandé)
- Colonnes :
  - Prénom
  - Nom
  - Mail
  - Adresse
  - Code Postal
  - Téléphone
  - Pts niv 1 (avec badge coloré bleu)
  - Cadeau niv 1
  - Pts niv 2 (avec badge coloré violet)
  - Cadeau niv 2
  - Pts niv 3 (avec badge coloré vert)
  - Cadeau niv 3

**Features** :
- Bouton "Actualiser" pour recharger les données
- Compteur total d'abonnés
- Gestion des états de chargement
- Gestion des erreurs
- Design responsive avec Tailwind CSS
- Support du mode sombre
- Effet hover sur les lignes
- Scroll horizontal automatique si le tableau dépasse la largeur

**Utilisation du tableau scrollable** :
```tsx
<div className="overflow-x-auto">
  <table className="min-w-full divide-y divide-gray-200">
    {/* Contenu du tableau */}
  </table>
</div>
```

### 4. Pages placeholder

Les pages suivantes ont été créées avec un design cohérent indiquant "en cours de développement" :
- Questions
- Zones
- Cadeaux
- Stats
- Communication
- Utilisateurs

Chaque page inclut :
- Titre et description
- Icône appropriée
- Message "Page en cours de développement"

## API Client

### Endpoints disponibles

**Authentification** :
```typescript
apiClient.login(email, password)
apiClient.logout()
apiClient.me()
apiClient.refreshToken()
```

**Gestion des joueurs/abonnés** :
```typescript
apiClient.getUsers()           // GET /players
apiClient.getUser(id)          // GET /players/{id}
apiClient.createUser(data)     // POST /users
apiClient.updateUser(id, data) // PUT /users/{id}
apiClient.deleteUser(id)       // DELETE /users/{id}
```

### Exemple d'utilisation

```typescript
import { apiClient } from '@/lib/api-client';

// Récupérer tous les joueurs
const response = await apiClient.getUsers();

if (response.error) {
  console.error(response.error);
} else {
  const users = response.data;
  console.log(users);
}
```

## Authentification

### Flux de connexion

1. L'admin accède à `/login`
2. Il entre email et mot de passe
3. L'application envoie une requête à `/api/auth/login`
4. Si succès :
   - Token JWT stocké dans localStorage (clé : `admin_auth_token`)
   - Données utilisateur stockées (clé : `admin_auth_user`)
   - Redirection vers `/abonnes`
5. Si échec :
   - Message d'erreur affiché

### Protection des routes

Toutes les pages dans `(admin)/` sont automatiquement protégées par le layout :

```typescript
useEffect(() => {
  if (!isLoading && !isAuthenticated) {
    router.push('/login');
  }
}, [isAuthenticated, isLoading, router]);
```

### Hook useAuth

```typescript
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  // Utilisation...
}
```

## Styling

### Thème de couleurs

- **Couleur principale** : Vert (`green-600`, `green-700`)
- **Backgrounds** : Blanc / Gris clair (mode sombre : Gris foncé)
- **Texte** : Gris foncé (mode sombre : Blanc)
- **Badges points** :
  - Niveau 1 : Bleu (`blue-100`, `blue-800`)
  - Niveau 2 : Violet (`purple-100`, `purple-800`)
  - Niveau 3 : Vert (`green-100`, `green-800`)

### Responsive Design

- **Desktop** : Menu horizontal complet
- **Tablet/Mobile** : Menu qui s'adapte avec wrapping
- **Très petits écrans** : Logo simplifié, menu sous la barre

### Mode sombre

Toutes les pages supportent le mode sombre via les classes Tailwind `dark:*`

## Configuration

### Variables d'environnement

Fichier `.env.local` :

```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### TypeScript

Les alias de chemins sont configurés dans `tsconfig.json` :

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./app/*"]
    }
  }
}
```

## Démarrage

```bash
cd backoffice
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:3001`

### Ports recommandés

- API Laravel : `http://localhost:8000`
- Frontoffice : `http://localhost:3000`
- Backoffice : `http://localhost:3001`

## Fonctionnalités à venir

### Page Abonnés
- [ ] Recherche et filtres
- [ ] Tri par colonnes
- [ ] Pagination
- [ ] Export CSV/Excel
- [ ] Détails d'un abonné (modal ou page dédiée)
- [ ] Actions (éditer, supprimer, désactiver)

### Page Questions
- [ ] Liste des questions
- [ ] CRUD questions
- [ ] Catégories de questions
- [ ] Niveaux de difficulté

### Page Zones
- [ ] Liste des zones géographiques
- [ ] CRUD zones
- [ ] Carte interactive

### Page Cadeaux
- [ ] Liste des cadeaux
- [ ] CRUD cadeaux
- [ ] Gestion des stocks
- [ ] Attribution des cadeaux

### Page Stats
- [ ] Dashboard avec graphiques
- [ ] Statistiques utilisateurs
- [ ] Statistiques de jeu
- [ ] Export de rapports

### Page Communication
- [ ] Envoi d'emails
- [ ] Notifications push
- [ ] Templates de messages
- [ ] Historique des communications

### Page Utilisateurs
- [ ] Gestion des administrateurs
- [ ] Rôles et permissions
- [ ] CRUD utilisateurs admin

## Sécurité

### Bonnes pratiques implémentées

1. **Tokens JWT** : Stockage sécurisé dans localStorage
2. **Protection de routes** : Vérification systématique de l'authentification
3. **Déconnexion automatique** : En cas de token expiré (401)
4. **Headers sécurisés** : Authorization Bearer token
5. **Validation côté client** : Avant envoi à l'API

### Points d'attention

- Les tokens sont dans localStorage (vulnérable au XSS)
- Considérer l'utilisation de httpOnly cookies pour plus de sécurité
- Implémenter le refresh automatique des tokens
- Ajouter un timeout de session

## Tests

### Tests à implémenter

```bash
# Tests unitaires
npm run test

# Tests E2E
npm run test:e2e
```

Frameworks recommandés :
- Jest + React Testing Library (unitaires)
- Playwright ou Cypress (E2E)

## Support

### Problèmes courants

**1. Erreur de connexion à l'API**
- Vérifier que l'API Laravel est démarrée
- Vérifier l'URL dans `.env.local`
- Vérifier les CORS côté Laravel

**2. Redirection infinie vers /login**
- Vérifier que le token est bien stocké
- Vérifier que l'endpoint `/auth/me` fonctionne
- Consulter la console pour les erreurs

**3. Tableau des abonnés vide**
- Vérifier l'endpoint `/api/players`
- Vérifier les permissions du rôle
- Consulter les logs Laravel

## Contribution

Pour ajouter une nouvelle page admin :

1. Créer le fichier dans `app/(admin)/ma-page/page.tsx`
2. Ajouter l'entrée dans `navItems` de [Navbar.tsx](backoffice/app/components/layout/Navbar.tsx)
3. Créer les endpoints nécessaires dans [api-client.ts](backoffice/app/lib/api-client.ts)
4. Tester l'authentification et l'affichage

## Licence

Ce code fait partie du projet EcoloQuiz.
