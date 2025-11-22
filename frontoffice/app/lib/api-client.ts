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

  async register(first_name: string, last_name: string, email: string, password: string, password_confirmation: string, zone_id?: string) {
    const body: any = { first_name, last_name, email, password, password_confirmation };
    if (zone_id) body.zone_id = zone_id;

    return this.request<{ access_token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(body),
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

  // Themes endpoints
  async getThemes() {
    return this.request<any>('/themes', {
      method: 'GET',
    });
  }

  // Zones endpoints
  async getZones() {
    return this.request<any[]>('/zones', {
      method: 'GET',
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

  async getCurrentGame() {
    return this.request<{
      has_game_in_progress: boolean;
      theme_id: string | null;
      theme_name: string | null;
    }>('/player/current-game', {
      method: 'GET',
    });
  }

  async getQuizToPlay(quizId: string) {
    return this.request<any>(`/player/quiz/${quizId}/play`, {
      method: 'GET',
    });
  }

  async getNextQuestion(themeId: string) {
    return this.request<any>(`/player/theme/${themeId}/next-question`, {
      method: 'GET',
    });
  }

  async validateAnswer(quizId: string, questionId: string, answer: string | string[]) {
    const payload = Array.isArray(answer)
      ? { question_id: questionId, answer_ids: answer }
      : { question_id: questionId, answer_id: answer };

    return this.request<{
      is_correct: boolean;
      points_earned: number;
      correct_answer_ids: string[];
      correct_answer_texts: string[];
      explanation?: string;
      new_total_points?: number;
      is_multiple_answers?: boolean;
      won_gift?: {
        id: string;
        name: string;
        description: string;
        image_url: string;
        company_name: string;
        milestone: number;
      };
    }>(`/player/quiz/${quizId}/validate-answer`, {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async submitQuiz(quizId: string, answers: Record<string, string>) {
    return this.request<{
      score: number;
      totalQuestions: number;
      correctAnswers: number;
      results: Array<any>;
      newTotalPoints: number;
    }>(`/player/quiz/${quizId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ answers }),
    });
  }

  async getPlayerGifts() {
    return this.request<{
      gifts: Array<{
        id: string;
        gift_id: string;
        player_id: string;
        allocated_at: string;
        status: string;
        redeemed_at: string | null;
        gift: {
          id: string;
          name: string;
          description: string;
          image_url: string;
          company_name: string;
        };
      }>;
      next_milestone: number;
      points_to_next: number;
      current_points: number;
    }>('/player/gifts', {
      method: 'GET',
    });
  }

  async getPlayerStats() {
    return this.request<{
      player: {
        points: number;
        current_level: number;
        last_milestone: number;
      };
      performance: {
        total_answers: number;
        correct_answers: number;
        wrong_answers: number;
        accuracy: number;
      };
      by_theme: Array<{
        name: string;
        total_answers: number;
        correct_answers: number;
      }>;
      progression_7_days: Array<{
        date: string;
        points_earned: number;
        questions_answered: number;
      }>;
      gifts_won: number;
    }>('/player/stats', {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
