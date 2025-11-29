/**
 * Authentication helper functions for managing post-login redirects
 */

const RETURN_URL_KEY = 'returnUrl';

export const authHelpers = {
    /**
     * Store the URL to return to after login
     */
    setReturnUrl: (url: string): void => {
        if (typeof window !== 'undefined') {
            sessionStorage.setItem(RETURN_URL_KEY, url);
        }
    },

    /**
     * Get the stored return URL, default to /dashboard
     */
    getReturnUrl: (): string => {
        if (typeof window !== 'undefined') {
            return sessionStorage.getItem(RETURN_URL_KEY) || '/dashboard';
        }
        return '/dashboard';
    },

    /**
     * Clear the stored return URL
     */
    clearReturnUrl: (): void => {
        if (typeof window !== 'undefined') {
            sessionStorage.removeItem(RETURN_URL_KEY);
        }
    },

    /**
     * Check if user is authenticated (has token)
     */
    isAuthenticated: (): boolean => {
        if (typeof window !== 'undefined') {
            return !!localStorage.getItem('token');
        }
        return false;
    }
};
