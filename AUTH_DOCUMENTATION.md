# Documentation d'Authentification - EcoloQuiz

Ce document explique comment utiliser les pages de connexion et de gestion des mots de passe pour le frontoffice et le backoffice d'EcoloQuiz.

## Vue d'ensemble

Le système d'authentification a été créé pour les deux applications Next.js :
- **Frontoffice** : Application destinée aux utilisateurs finaux
- **Backoffice** : Panneau d'administration réservé aux administrateurs

## Architecture

### Structure des fichiers

#### Frontoffice (`/frontoffice/app/`)
```
frontoffice/app/
├── components/
│   └── common/
│       ├── Input.tsx          # Composant Input réutilisable
│       └── Button.tsx         # Composant Button réutilisable
├── lib/
│   ├── api-client.ts          # Client API avec gestion JWT
│   └── storage.ts             # Gestion du localStorage
├── context/
│   └── AuthContext.tsx        # Contexte d'authentification global
└── (auth)/
    ├── login/
    │   └── page.tsx           # Page de connexion
    ├── forgot-password/
    │   └── page.tsx           # Page "Mot de passe oublié"
    └── reset-password/
        └── page.tsx           # Page de réinitialisation
```

#### Backoffice (`/backoffice/app/`)
```
backoffice/app/
├── components/
│   └── common/
│       ├── Input.tsx          # Composant Input réutilisable
│       └── Button.tsx         # Composant Button réutilisable
├── lib/
│   ├── api-client.ts          # Client API avec gestion JWT
│   └── storage.ts             # Gestion du localStorage
├── context/
│   └── AuthContext.tsx        # Contexte d'authentification global
└── (auth)/
    └── login/
        └── page.tsx           # Page de connexion (sans mot de passe oublié)
```

## Pages créées

### 1. Frontoffice

#### Page de Connexion
- **Route** : `/login`
- **Fonctionnalités** :
  - Champs : Identifiant (email) et Mot de passe
  - Validation côté client
  - Messages d'erreur clairs
  - Lien vers "Mot de passe oublié"
  - Lien vers "S'inscrire"
  - Design responsive avec Tailwind CSS
  - Support du mode sombre

#### Page Mot de passe oublié
- **Route** : `/forgot-password`
- **Fonctionnalités** :
  - Champ : Email
  - Validation de l'email
  - Envoie un email de réinitialisation si l'email existe
  - Message de confirmation après envoi
  - Lien de retour vers la page de connexion

#### Page Réinitialiser le mot de passe
- **Route** : `/reset-password?token=XXX&email=user@example.com`
- **Fonctionnalités** :
  - Champs : Nouveau mot de passe et Confirmation
  - Validation des mots de passe (minimum 8 caractères)
  - Vérification que les deux mots de passe correspondent
  - Affichage des critères de mot de passe
  - Message de succès avec redirection automatique
  - Gestion des liens invalides ou expirés

### 2. Backoffice

#### Page de Connexion Admin
- **Route** : `/login`
- **Fonctionnalités** :
  - Champs : Identifiant (email) et Mot de passe
  - Validation côté client
  - Messages d'erreur clairs
  - Design spécifique avec icône d'administration
  - **SANS** lien "Mot de passe oublié" (comme demandé)
  - Message "Accès réservé aux administrateurs"

## Configuration

### Variables d'environnement

Créez un fichier `.env.local` dans chaque application (frontoffice et backoffice) :

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

Les fichiers `.env.example` sont fournis comme référence.

### API Backend (Laravel)

L'API Laravel doit avoir les endpoints suivants configurés :

#### Authentification
- `POST /api/auth/login` - Connexion
  - Body: `{ email, password }`
  - Retourne: `{ token, user }`

- `POST /api/auth/logout` - Déconnexion
  - Headers: `Authorization: Bearer {token}`

- `GET /api/auth/me` - Informations utilisateur actuel
  - Headers: `Authorization: Bearer {token}`

- `POST /api/auth/refresh` - Rafraîchir le token
  - Headers: `Authorization: Bearer {token}`

#### Gestion des mots de passe
- `POST /api/auth/forgot-password` - Demande de réinitialisation
  - Body: `{ email }`

- `POST /api/auth/reset-password` - Réinitialisation
  - Body: `{ token, email, password, password_confirmation }`

## Utilisation

### Démarrer les applications

#### Frontoffice
```bash
cd frontoffice
npm install
npm run dev
```
Accès : http://localhost:3000/login

#### Backoffice
```bash
cd backoffice
npm install
npm run dev
```
Accès : http://localhost:3001/login (port différent)

### Flux d'authentification

#### 1. Connexion
1. L'utilisateur entre son email et mot de passe
2. Le client envoie une requête à `/api/auth/login`
3. Si succès, le token JWT et les données utilisateur sont stockés dans localStorage
4. L'utilisateur est redirigé vers `/dashboard`

#### 2. Mot de passe oublié (Frontoffice uniquement)
1. L'utilisateur clique sur "Mot de passe oublié"
2. Il entre son email
3. Le client envoie une requête à `/api/auth/forgot-password`
4. Un email est envoyé avec un lien de réinitialisation
5. L'utilisateur clique sur le lien : `/reset-password?token=XXX&email=user@example.com`
6. Il entre un nouveau mot de passe
7. Le client envoie une requête à `/api/auth/reset-password`
8. Redirection vers `/login` après succès

#### 3. Déconnexion
```typescript
import { useAuth } from '@/context/AuthContext';

function Component() {
  const { logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    // Redirection automatique ou manuelle
  };

  return <button onClick={handleLogout}>Se déconnecter</button>;
}
```

## Composants réutilisables

### Input
```typescript
import Input from '@/components/common/Input';

<Input
  id="email"
  name="email"
  type="email"
  label="Email"
  placeholder="Entrez votre email"
  value={email}
  onChange={handleChange}
  error={error}
  required
/>
```

### Button
```typescript
import Button from '@/components/common/Button';

<Button
  type="submit"
  isLoading={isSubmitting}
  variant="primary" // primary | secondary | danger
>
  Se connecter
</Button>
```

## Hooks personnalisés

### useAuth
```typescript
import { useAuth } from '@/context/AuthContext';

function Component() {
  const {
    user,              // Utilisateur connecté ou null
    isAuthenticated,   // Boolean
    isLoading,         // Boolean
    login,             // (email, password) => Promise
    logout,            // () => Promise
    refreshUser        // () => Promise
  } = useAuth();

  // Exemple d'utilisation
  if (isLoading) return <div>Chargement...</div>;
  if (!isAuthenticated) return <div>Non connecté</div>;

  return <div>Bienvenue {user.name}</div>;
}
```

## Sécurité

### Stockage des tokens
- Les tokens JWT sont stockés dans localStorage
- Les tokens sont automatiquement ajoutés aux headers des requêtes API
- En cas d'erreur 401, le localStorage est vidé automatiquement

### Validation
- Validation côté client pour une meilleure UX
- Validation côté serveur (Laravel) pour la sécurité
- Messages d'erreur clairs sans révéler d'informations sensibles

### Mots de passe
- Minimum 8 caractères pour la réinitialisation
- Confirmation requise
- Hashing côté serveur (Laravel)

## Personnalisation

### Couleurs
Les pages utilisent Tailwind CSS avec la couleur verte comme thème principal. Pour changer :
- Modifier les classes `bg-green-600`, `text-green-600`, etc.
- Ou configurer le thème Tailwind dans `tailwind.config.js`

### Validation
Les règles de validation sont dans chaque page :
- Email : Format email valide
- Mot de passe login : Minimum 6 caractères
- Mot de passe reset : Minimum 8 caractères

Pour modifier, éditez la fonction `validateForm()` dans chaque page.

## Prochaines étapes suggérées

1. **Protection des routes** : Créer un middleware pour protéger les pages nécessitant une authentification
2. **Page d'inscription** : Créer `/register` pour le frontoffice
3. **Page dashboard** : Créer la page de destination après connexion
4. **Gestion des rôles** : Ajouter la vérification des rôles (admin, user, etc.)
5. **Remember me** : Ajouter une option "Se souvenir de moi"
6. **2FA** : Implémenter l'authentification à deux facteurs
7. **Tests** : Ajouter des tests unitaires et d'intégration

## Support

Pour toute question ou problème :
1. Vérifiez que l'API Laravel est bien démarrée
2. Vérifiez les variables d'environnement
3. Consultez la console du navigateur pour les erreurs
4. Vérifiez les logs de l'API Laravel

## Licence

Ce code fait partie du projet EcoloQuiz.
