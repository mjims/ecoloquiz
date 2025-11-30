'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from '@admin/lib/api-client';
import { storage } from '@admin/lib/storage';

interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string;
  created_at: string;
  updated_at: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const response = await apiClient.me();

      if (response.data && response.data.user) {
        storage.setUser(response.data.user);
        setUser(response.data.user);
      } else if (response.error) {
        // Token invalid, clear everything
        storage.clear();
        setUser(null);
      }
    } catch (error) {
      console.error('Refresh user error:', error);
      storage.clear();
      setUser(null);
    }
  };

  // Check if user is logged in on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = storage.getToken();
      const storedUser = storage.getUser();

      if (token && storedUser) {
        setUser(storedUser);
        // Optionally refresh user data from server
        await refreshUser();
      }

      setIsLoading(false);
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);

    try {
      const response = await apiClient.login(email, password);

      if (response.error) {
        setIsLoading(false);
        return { success: false, error: response.error };
      }

      if (response.data) {
        const { access_token, user } = response.data;

        // Store token and user in localStorage
        storage.setToken(access_token);
        storage.setUser(user);

        // Update state
        setUser(user);

        setIsLoading(false);
        return { success: true };
      }

      setIsLoading(false);
      return { success: false, error: 'Réponse invalide du serveur' };
    } catch (error) {
      setIsLoading(false);
      return { success: false, error: 'Une erreur est survenue' };
    }
  };

  const logout = async () => {
    setIsLoading(true);

    try {
      await apiClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    }

    // Clear storage and state regardless of API response
    storage.clear();
    setUser(null);
    setIsLoading(false);
  };

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
