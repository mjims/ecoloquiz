# Guide de Pagination - Backoffice Écolo Quiz

## 🎯 Système de Préférences Globales

Le backoffice utilise un système de **préférences de pagination globales** :
- ✅ Quand l'utilisateur change le nombre d'items par page, ce choix est **sauvegardé globalement**
- ✅ Ce choix s'applique **automatiquement à toutes les pages** du backoffice
- ✅ La préférence persiste même après **rafraîchissement** ou **déconnexion/reconnexion**
- ✅ Stockage dans `localStorage` avec la clé `pagination_preferences.global_per_page`

---

## 📖 Utilisation

### Méthode 1 : Utiliser le composant `PaginationControls` (Recommandé)

```tsx
import { useState, useEffect } from 'react';
import { usePagination } from '@/hooks/usePagination';
import PaginationControls from '@/components/common/PaginationControls';

export default function MyPage() {
  const [items, setItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const pagination = usePagination();

  // Charger les données quand la page ou perPage change
  useEffect(() => {
    loadData(pagination.currentPage, pagination.perPage);
  }, [pagination.currentPage, pagination.perPage]);

  const loadData = async (page: number, perPage: number) => {
    setIsLoading(true);
    const response = await apiClient.getData(page, perPage);

    if (response.data) {
      setItems(response.data.data);
      pagination.setTotalPages(response.data.last_page);
      pagination.setTotalItems(response.data.total);
    }

    setIsLoading(false);
  };

  return (
    <div>
      {/* Votre contenu */}
      <div>{/* Tableau, grille, etc. */}</div>

      {/* Pagination */}
      <PaginationControls
        currentPage={pagination.currentPage}
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        perPage={pagination.perPage}
        onPageChange={pagination.setCurrentPage}
        onPerPageChange={pagination.setPerPage}
        itemLabel="éléments" // optionnel: "pages", "utilisateurs", etc.
      />
    </div>
  );
}
```

### Méthode 2 : Utilisation manuelle (Legacy)

Pour les pages existantes, le code continue de fonctionner :

```tsx
import { getPagePreference, savePagePreference } from '@/lib/pagination-preferences';

const [perPage, setPerPage] = useState(() => getPagePreference('mypage', 15));

const handlePerPageChange = (newPerPage: number) => {
  setPerPage(newPerPage);
  savePagePreference('mypage', newPerPage); // Utilise la préférence globale en interne
  setCurrentPage(1);
};
```

**Note** : Même si vous passez un nom de page, les fonctions `getPagePreference()` et `savePagePreference()` utilisent maintenant la préférence globale en interne. C'est une couche de compatibilité.

---

## 🔧 API de Pagination

### Hook `usePagination`

```tsx
const pagination = usePagination({ defaultPerPage: 15 });

// Propriétés disponibles
pagination.currentPage    // Numéro de la page actuelle
pagination.perPage        // Nombre d'items par page
pagination.totalPages     // Nombre total de pages
pagination.totalItems     // Nombre total d'items

// Méthodes
pagination.setCurrentPage(5)        // Aller à la page 5
pagination.setPerPage(25)           // Changer le nombre d'items
pagination.setTotalPages(10)        // Définir le total de pages
pagination.setTotalItems(234)       // Définir le total d'items
pagination.resetPagination()        // Réinitialiser tout
```

### Fonctions de préférences

```tsx
import {
  getGlobalPreference,
  saveGlobalPreference,
  resetPaginationPreferences
} from '@/lib/pagination-preferences';

// Récupérer la préférence globale
const perPage = getGlobalPreference(); // Retourne 15 par défaut

// Sauvegarder une nouvelle préférence
saveGlobalPreference(25); // S'applique à TOUTES les pages

// Réinitialiser
resetPaginationPreferences(); // Supprime du localStorage
```

---

## 🎨 Composant PaginationControls

### Props

| Prop | Type | Description |
|------|------|-------------|
| `currentPage` | `number` | Page actuelle (1-indexed) |
| `totalPages` | `number` | Nombre total de pages |
| `totalItems` | `number` | Nombre total d'items |
| `perPage` | `number` | Items par page actuels |
| `onPageChange` | `(page: number) => void` | Callback changement de page |
| `onPerPageChange` | `(perPage: number) => void` | Callback changement perPage |
| `itemLabel` | `string` | Label des items (optionnel, défaut: "éléments") |

### Exemple complet

```tsx
<PaginationControls
  currentPage={2}
  totalPages={10}
  totalItems={234}
  perPage={25}
  onPageChange={(page) => setCurrentPage(page)}
  onPerPageChange={(perPage) => {
    saveGlobalPreference(perPage);
    setPerPage(perPage);
    setCurrentPage(1);
  }}
  itemLabel="utilisateurs"
/>
```

---

## 📋 Pages qui utilisent la pagination

Liste des pages actuellement paginées :

- ✅ `/communication/blogs` - Gestion des pages/blogs
- ✅ `/communication/mails` - Templates emails
- ✅ `/questions` - Questions de quiz
- ✅ `/utilisateurs` - Utilisateurs admin
- ✅ `/zones` - Zones géographiques

**Note** : La page `/abonnes` (joueurs) devrait être mise à jour pour utiliser la pagination car elle peut contenir jusqu'à 15 000 utilisateurs.

---

## 🔄 Fonctionnement technique

1. **Initialisation** : Au chargement, le hook/composant lit `localStorage`
2. **Changement** : Quand l'utilisateur change le perPage, c'est sauvegardé globalement
3. **Propagation** : Toutes les autres pages utilisent automatiquement cette nouvelle valeur
4. **Persistance** : La préférence survit aux rafraîchissements et reconnexions

### Structure localStorage

```json
{
  "pagination_preferences": {
    "global_per_page": 25
  }
}
```

---

## ✨ Avantages

- ✅ **Cohérence** : Même expérience sur toutes les pages
- ✅ **Persistance** : Préférence sauvegardée automatiquement
- ✅ **Simplicité** : Un seul composant/hook réutilisable
- ✅ **Rétrocompatibilité** : Le code existant continue de fonctionner
- ✅ **UX améliorée** : L'utilisateur n'a pas à re-configurer sur chaque page

---

## 🔮 Futures améliorations possibles

- [ ] Ajouter une option "Tout afficher" (désactiver pagination)
- [ ] Permettre des préférences par type de page (optionnel)
- [ ] Sauvegarder la dernière page visitée par section
- [ ] Ajouter des raccourcis clavier (← →)
