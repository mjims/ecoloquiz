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

  async refreshToken() {
    return this.request<{ token: string }>('/auth/refresh', {
      method: 'POST',
    });
  }

  // Users/Players endpoints
  async getUsers() {
    return this.request<any[]>('/players', {
      method: 'GET',
    });
  }

  async getUser(id: number) {
    return this.request<any>(`/players/${id}`, {
      method: 'GET',
    });
  }

  async createUser(userData: any) {
    return this.request<any>('/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateUser(id: number, userData: any) {
    return this.request<any>(`/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteUser(id: number) {
    return this.request<any>(`/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Questions endpoints
  async getQuestions(page: number = 1, perPage: number = 15, themeId?: string) {
    let url = `/questions?page=${page}&per_page=${perPage}`;
    if (themeId) {
      url += `&theme_id=${themeId}`;
    }
    return this.request<any>(url, {
      method: 'GET',
    });
  }

  async getQuestion(id: string) {
    return this.request<any>(`/questions/${id}`, {
      method: 'GET',
    });
  }

  async createQuestion(questionData: any) {
    return this.request<any>('/questions', {
      method: 'POST',
      body: JSON.stringify(questionData),
    });
  }

  async updateQuestion(id: string, questionData: any) {
    return this.request<any>(`/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(questionData),
    });
  }

  async deleteQuestion(id: string) {
    return this.request<any>(`/questions/${id}`, {
      method: 'DELETE',
    });
  }

  // Levels endpoints
  async getLevels() {
    return this.request<any>('/levels', {
      method: 'GET',
    });
  }

  // Zones endpoints
  async getZones(page: number = 1, perPage: number = 15) {
    return this.request<any>(`/zones?page=${page}&per_page=${perPage}`, {
      method: 'GET',
    });
  }

  async getZone(id: string) {
    return this.request<any>(`/zones/${id}`, {
      method: 'GET',
    });
  }

  async createZone(zoneData: any) {
    return this.request<any>('/zones', {
      method: 'POST',
      body: JSON.stringify(zoneData),
    });
  }

  async updateZone(id: string, zoneData: any) {
    return this.request<any>(`/zones/${id}`, {
      method: 'PUT',
      body: JSON.stringify(zoneData),
    });
  }

  async deleteZone(id: string) {
    return this.request<any>(`/zones/${id}`, {
      method: 'DELETE',
    });
  }

  // Question Import endpoints
  async downloadQuestionTemplate(type: 'questions' | 'unified' = 'questions') {
    const { downloadQuestionTemplate } = await import('@/lib/templateGenerator');
    downloadQuestionTemplate(type);
  }

  async validateQuestionImport(file: File, type: 'questions' | 'unified' = 'questions') {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);

    return this.request<any>('/questions/import/validate', {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type for FormData
    });
  }

  async executeQuestionImport(data: any, type: 'questions' | 'unified') {
    return this.request<any>('/questions/import/execute', {
      method: 'POST',
      body: JSON.stringify({ data, type }),
    });
  }

  // Theme Import endpoints
  async downloadThemeTemplate() {
    const { downloadThemeTemplate } = await import('@/lib/templateGenerator');
    downloadThemeTemplate();
  }

  async validateThemeImport(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.request<any>('/themes/import/validate', {
      method: 'POST',
      body: formData,
      headers: {},
    });
  }

  async executeThemeImport(data: any) {
    return this.request<any>('/themes/import/execute', {
      method: 'POST',
      body: JSON.stringify({ data }),
    });
  }

  // Regions endpoints
  async getRegions() {
    return this.request<any>('/regions', {
      method: 'GET',
    });
  }

  async getRegion(id: number) {
    return this.request<any>(`/regions/${id}`, {
      method: 'GET',
    });
  }

  // Upload endpoints
  async uploadImage(file: File) {
    const formData = new FormData();
    formData.append('image', file);

    const token = storage.getToken();

    try {
      const response = await fetch(`${this.baseURL}/upload/image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return { error: data.error || data.message || 'Upload failed', data: null, success: false };
      }

      return { data, error: null, success: true };
    } catch (error: any) {
      return { error: error.message || 'Network error', data: null, success: false };
    }
  }

  // Themes endpoints
  async getThemes(page: number = 1) {
    return this.request<any>(`/themes?page=${page}`, {
      method: 'GET',
    });
  }

  async getTheme(id: string) {
    return this.request<any>(`/themes/${id}`, {
      method: 'GET',
    });
  }

  async createTheme(themeData: { title: string; description: string }) {
    return this.request<any>('/themes', {
      method: 'POST',
      body: JSON.stringify(themeData),
    });
  }

  async updateTheme(id: string, themeData: any) {
    return this.request<any>(`/themes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(themeData),
    });
  }

  async deleteTheme(id: string) {
    return this.request<any>(`/themes/${id}`, {
      method: 'DELETE',
    });
  }

  // Quizzes endpoints
  async getQuizzes(page: number = 1, themeId?: string) {
    const params = new URLSearchParams({ page: page.toString() });
    if (themeId) params.append('theme_id', themeId);

    return this.request<any>(`/quizzes?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getQuiz(id: string) {
    return this.request<any>(`/quizzes/${id}`, {
      method: 'GET',
    });
  }

  async createQuiz(quizData: { title: string; theme_id: string; level_id: number; max_score?: number }) {
    return this.request<any>('/quizzes', {
      method: 'POST',
      body: JSON.stringify(quizData),
    });
  }

  async updateQuiz(id: string, quizData: any) {
    return this.request<any>(`/quizzes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(quizData),
    });
  }

  async deleteQuiz(id: string) {
    return this.request<any>(`/quizzes/${id}`, {
      method: 'DELETE',
    });
  }

  // Email Templates endpoints
  async getEmailTemplates(page: number = 1, perPage: number = 15) {
    return this.request<any>(`/email-templates?page=${page}&per_page=${perPage}`, {
      method: 'GET',
    });
  }

  async getEmailTemplate(id: string) {
    return this.request<any>(`/email-templates/${id}`, {
      method: 'GET',
    });
  }

  async createEmailTemplate(templateData: any) {
    return this.request<any>('/email-templates', {
      method: 'POST',
      body: JSON.stringify(templateData),
    });
  }

  async updateEmailTemplate(id: string, templateData: any) {
    return this.request<any>(`/email-templates/${id}`, {
      method: 'PUT',
      body: JSON.stringify(templateData),
    });
  }

  async deleteEmailTemplate(id: string) {
    return this.request<any>(`/email-templates/${id}`, {
      method: 'DELETE',
    });
  }

  // Email Types endpoints
  async getEmailTypes() {
    return this.request<any>('/email-types', {
      method: 'GET',
    });
  }

  async getEmailType(id: string) {
    return this.request<any>(`/email-types/${id}`, {
      method: 'GET',
    });
  }

  async createEmailType(typeData: any) {
    return this.request<any>('/email-types', {
      method: 'POST',
      body: JSON.stringify(typeData),
    });
  }

  async updateEmailType(id: string, typeData: any) {
    return this.request<any>(`/email-types/${id}`, {
      method: 'PUT',
      body: JSON.stringify(typeData),
    });
  }

  async deleteEmailType(id: string) {
    return this.request<any>(`/email-types/${id}`, {
      method: 'DELETE',
    });
  }

  // Admin Users endpoints
  async getAdminUsers(page: number = 1, perPage: number = 15) {
    return this.request<any>(`/admin/users?page=${page}&per_page=${perPage}`, {
      method: 'GET',
    });
  }

  async getAdminUser(id: string) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'GET',
    });
  }

  async createAdminUser(userData: any) {
    return this.request<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  }

  async updateAdminUser(id: string, userData: any) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(userData),
    });
  }

  async deleteAdminUser(id: string) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'DELETE',
    });
  }

  // Pages endpoints
  async getPages(page: number = 1, perPage: number = 15, type?: string, is_active?: boolean) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });
    if (type) params.append('type', type);
    if (is_active !== undefined) params.append('is_active', is_active.toString());

    return this.request<any>(`/pages?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getPage(id: string) {
    return this.request<any>(`/pages/${id}`, {
      method: 'GET',
    });
  }

  async createPage(pageData: any) {
    return this.request<any>('/pages', {
      method: 'POST',
      body: JSON.stringify(pageData),
    });
  }

  async updatePage(id: string, pageData: any) {
    return this.request<any>(`/pages/${id}`, {
      method: 'PUT',
      body: JSON.stringify(pageData),
    });
  }

  async deletePage(id: string) {
    return this.request<any>(`/pages/${id}`, {
      method: 'DELETE',
    });
  }

  // Gifts endpoints
  async getGifts(page: number = 1, perPage: number = 15, level_ids?: string[], zone_id?: string, company_name?: string) {
    const params = new URLSearchParams({
      page: page.toString(),
      per_page: perPage.toString()
    });

    if (level_ids && level_ids.length > 0) {
      level_ids.forEach(id => params.append('level_id[]', id));
    }
    if (zone_id) params.append('zone_id', zone_id);
    if (company_name) params.append('company_name', company_name);

    return this.request<any>(`/gifts?${params.toString()}`, {
      method: 'GET',
    });
  }

  async getGift(id: string) {
    return this.request<any>(`/gifts/${id}`, {
      method: 'GET',
    });
  }

  async createGift(giftData: any) {
    return this.request<any>('/gifts', {
      method: 'POST',
      body: JSON.stringify(giftData),
    });
  }

  async updateGift(id: string, giftData: any) {
    return this.request<any>(`/gifts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(giftData),
    });
  }

  async deleteGift(id: string) {
    return this.request<any>(`/gifts/${id}`, {
      method: 'DELETE',
    });
  }

  async getNextGiftCode() {
    return this.request<{ code: string }>('/gifts/next-code', {
      method: 'GET',
    });
  }

  // Statistics
  async getStats(zoneId?: string, themeId?: string, startDate?: string, endDate?: string, levels?: string[]) {
    const params = new URLSearchParams();
    if (zoneId) params.append('zone_id', zoneId);
    if (themeId) params.append('theme_id', themeId);
    if (startDate) params.append('start_date', startDate);
    if (endDate) params.append('end_date', endDate);
    if (levels && levels.length > 0) {
      levels.forEach(level => params.append('levels[]', level));
    }
    const query = params.toString();
    return this.request<any>(`/stats${query ? '?' + query : ''}`, { method: 'GET' });
  }

  async getStatsFilters() {
    return this.request<any>('/stats/filters', { method: 'GET' });
  }

  async getDashboardStats() {
    return this.request<{
      total_players: number;
      total_active_players: number;
      total_questions_answered: number;
      total_gifts_allocated: number;
      total_points_earned: number;
      average_score: number;
      growth_last_month: number;
    }>('/stats/dashboard', { method: 'GET' });
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
