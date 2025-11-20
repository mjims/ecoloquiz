/**
 * Utilitaire pour gérer les préférences de pagination de l'utilisateur
 */

const STORAGE_KEY = 'pagination_preferences';

interface PaginationPreferences {
  [page: string]: number; // page => perPage
}

/**
 * Récupérer toutes les préférences de pagination
 */
export function getPaginationPreferences(): PaginationPreferences {
  if (typeof window === 'undefined') return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
}

/**
 * Récupérer la préférence de pagination pour une page spécifique
 */
export function getPagePreference(pageName: string, defaultValue: number = 15): number {
  const prefs = getPaginationPreferences();
  return prefs[pageName] || defaultValue;
}

/**
 * Sauvegarder la préférence de pagination pour une page
 */
export function savePagePreference(pageName: string, perPage: number): void {
  if (typeof window === 'undefined') return;

  try {
    const prefs = getPaginationPreferences();
    prefs[pageName] = perPage;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch (error) {
    console.error('Error saving pagination preference:', error);
  }
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
