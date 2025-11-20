import { storage } from './storage';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export interface ApiResponse<T = any> {
  data?: T;
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
}

class ApiClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = storage.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        // Handle unauthorized - clear storage
        if (response.status === 401) {
          storage.clear();
        }

        return {
          error: data.message || 'Une erreur est survenue',
          errors: data.errors,
        };
      }

      return { data };
    } catch (error) {
      console.error('API Error:', error);
      return {
        error: 'Erreur de connexion au serveur',
      };
    }
  }

  // Auth endpoints
  async login(email: string, password: string) {
    return this.request<{ access_token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async register(name: string, email: string, password: string, password_confirmation: string) {
    return this.request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, password_confirmation }),
    });
  }

  async logout() {
    return this.request('/auth/logout', {
      method: 'POST',
    });
  }

  async me() {
    return this.request<any>('/auth/me', {
      method: 'GET',
    });
  }

  async forgotPassword(email: string) {
    return this.request('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  }

  async resetPassword(token: string, email: string, password: string, password_confirmation: string) {
    return this.request('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, email, password, password_confirmation }),
    });
  }

  async refreshToken() {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  // Player Dashboard endpoints
  async getSuggestedQuiz() {
    return this.request<any>('/player/suggested-quiz', {
      method: 'GET',
    });
  }

  async getProgression() {
    return this.request<{
      quizCompleted: number;
      levels: Array<{
        level: number;
        name: string;
        percentage: number;
        stars: number;
      }>;
    }>('/player/progression', {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
