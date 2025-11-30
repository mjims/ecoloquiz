/**
 * Utilitaire pour gérer les préférences de pagination de l'utilisateur
 *
 * Le système utilise une préférence GLOBALE qui s'applique à toutes les pages.
 * Quand l'utilisateur change le nombre d'items par page sur n'importe quelle page,
 * cette préférence est sauvegardée et appliquée automatiquement sur toutes les autres pages.
 */

const STORAGE_KEY = 'pagination_preferences';
const GLOBAL_KEY = 'global_per_page';
const DEFAULT_PER_PAGE = 15;

interface PaginationPreferences {
  [GLOBAL_KEY]: number;
  [page: string]: number; // Pour compatibilité/cas spéciaux futurs
}

/**
 * Récupérer toutes les préférences de pagination
 */
export function getPaginationPreferences(): PaginationPreferences {
  if (typeof window === 'undefined') return { [GLOBAL_KEY]: DEFAULT_PER_PAGE };

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    const prefs = stored ? JSON.parse(stored) : {};

    // S'assurer que la clé globale existe
    if (!prefs[GLOBAL_KEY]) {
      prefs[GLOBAL_KEY] = DEFAULT_PER_PAGE;
    }

    return prefs;
  } catch {
    return { [GLOBAL_KEY]: DEFAULT_PER_PAGE };
  }
}

/**
 * Récupérer la préférence globale de pagination (utilisée par toutes les pages)
 */
export function getGlobalPreference(): number {
  const prefs = getPaginationPreferences();
  return prefs[GLOBAL_KEY] || DEFAULT_PER_PAGE;
}

/**
 * Sauvegarder la préférence globale de pagination
 * Cette préférence s'applique à TOUTES les pages du backoffice
 */
export function saveGlobalPreference(perPage: number): void {
  if (typeof window === 'undefined') return;

  try {
    const prefs = getPaginationPreferences();
    prefs[GLOBAL_KEY] = perPage;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error saving pagination preference:', error);
  }
}

/**
 * Récupérer la préférence de pagination pour une page spécifique
 * Par défaut, utilise la préférence globale
 * @deprecated Utilisez getGlobalPreference() pour une expérience cohérente
 */
export function getPagePreference(pageName: string, defaultValue: number = DEFAULT_PER_PAGE): number {
  // Utiliser la préférence globale par défaut
  return getGlobalPreference();
}

/**
 * Sauvegarder la préférence de pagination
 * @deprecated Utilisez saveGlobalPreference() pour une expérience cohérente
 */
export function savePagePreference(pageName: string, perPage: number): void {
  // Sauvegarder en global pour que ça s'applique partout
  saveGlobalPreference(perPage);
}

/**
 * Réinitialiser toutes les préférences de pagination
 */
export function resetPaginationPreferences(): void {
  if (typeof window === 'undefined') return;

  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error resetting pagination preferences:', error);
  }
}
