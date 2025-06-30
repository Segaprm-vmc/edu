import axios, { AxiosInstance, AxiosError } from 'axios';

// Типы данных
export interface MotorcycleModel {
  id: number;
  name: string;
  description?: string;
  sales_script?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
  videos: ModelVideo[];
  photos: ModelPhoto[];
  specs: ModelSpec[];
}

export interface ModelVideo {
  id: number;
  model_id: number;
  title?: string;
  url: string;
  video_type?: string;
  sort_order: number;
  created_at: string;
}

export interface ModelPhoto {
  id: number;
  model_id: number;
  filename: string;
  original_filename?: string;
  file_path: string;
  file_size?: number;
  is_primary: boolean;
  sort_order: number;
  created_at: string;
}

export interface ModelSpec {
  id?: number;
  model_id?: number;
  spec_name: string;
  spec_value: string;
  spec_unit?: string;
  category?: string;
  sort_order?: number;
  created_at?: string;
}

export interface News {
  id: number;
  title: string;
  content: string;
  summary?: string;
  author?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at?: string;
  photos: NewsPhoto[];
  documents: NewsDocument[];
}

export interface NewsPhoto {
  id: number;
  news_id: number;
  filename: string;
  file_path: string;
  sort_order: number;
}

export interface NewsDocument {
  id: number;
  news_id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size?: number;
}

export interface Employee {
  id: number;
  first_name: string;
  last_name: string;
  position: string;
  email?: string;
  phone?: string;
  description?: string;
  photo_path?: string;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at?: string;
}

export interface Regulation {
  id: number;
  title: string;
  content: string;
  summary?: string;
  category?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
  updated_at?: string;
  photos: RegulationPhoto[];
  documents: RegulationDocument[];
}

export interface RegulationPhoto {
  id: number;
  regulation_id: number;
  filename: string;
  file_path: string;
  sort_order: number;
}

export interface RegulationDocument {
  id: number;
  regulation_id: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size?: number;
}

export interface SectionVisibility {
  news: boolean;
  regulations: boolean;
  employees: boolean;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

// Конфигурация API клиента
class ApiService {
  private client: AxiosInstance;
  private authToken: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: '/api',
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Интерсептор для добавления токена аутентификации
    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers.Authorization = `Bearer ${this.authToken}`;
      }
      return config;
    });

    // Интерсептор для обработки ошибок
    this.client.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
      }
    );
  }

  // Аутентификация
  setAuthToken(token: string) {
    this.authToken = token;
  }

  clearAuthToken() {
    this.authToken = null;
  }

  // Публичные API методы
  async getModels(): Promise<MotorcycleModel[]> {
    const response = await this.client.get('/models');
    return response.data;
  }

  async getModel(id: number): Promise<MotorcycleModel> {
    const response = await this.client.get(`/models/${id}`);
    return response.data;
  }

  async searchModels(query: string): Promise<MotorcycleModel[]> {
    const response = await this.client.get(`/models/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async filterModels(filters: Record<string, any>): Promise<MotorcycleModel[]> {
    const response = await this.client.post('/models/filter', filters);
    return response.data;
  }

  async getNews(page = 1, size = 20): Promise<PaginatedResponse<News>> {
    const response = await this.client.get(`/news?page=${page}&size=${size}`);
    return response.data;
  }

  async getNewsItem(id: number): Promise<News> {
    const response = await this.client.get(`/news/${id}`);
    return response.data;
  }

  async getRegulations(page = 1, size = 20): Promise<PaginatedResponse<Regulation>> {
    const response = await this.client.get(`/regulations?page=${page}&size=${size}`);
    return response.data;
  }

  async getRegulation(id: number): Promise<Regulation> {
    const response = await this.client.get(`/regulations/${id}`);
    return response.data;
  }

  async getEmployees(): Promise<Employee[]> {
    const response = await this.client.get('/employees');
    return response.data;
  }

  async searchEmployees(query: string): Promise<Employee[]> {
    const response = await this.client.get(`/employees/search?q=${encodeURIComponent(query)}`);
    return response.data;
  }

  async getSectionVisibility(): Promise<SectionVisibility> {
    const response = await this.client.get('/sections/visibility');
    return response.data;
  }

  // Административные API методы
  async adminLogin(password: string): Promise<{ access_token: string; token_type: string; expires_in: number }> {
    const response = await this.client.post('/admin/auth/login', { password });
    const { access_token } = response.data;
    this.setAuthToken(access_token);
    return response.data;
  }

  async adminLogout() {
    this.clearAuthToken();
  }

  // CRUD для моделей мотоциклов
  async createModel(data: Partial<MotorcycleModel>): Promise<MotorcycleModel> {
    const response = await this.client.post('/admin/models', data);
    return response.data;
  }

  async updateModel(id: number, data: Partial<MotorcycleModel>): Promise<MotorcycleModel> {
    const response = await this.client.put(`/admin/models/${id}`, data);
    return response.data;
  }

  async deleteModel(id: number): Promise<void> {
    await this.client.delete(`/admin/models/${id}`);
  }

  // Загрузка файлов
  async uploadModelPhoto(modelId: number, file: File): Promise<ModelPhoto> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await this.client.post(`/admin/models/${modelId}/photos`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  // Управление фотографиями моделей
  async getModelPhotos(modelId: number): Promise<ModelPhoto[]> {
    const response = await this.client.get(`/admin/models/${modelId}/photos`);
    return response.data;
  }

  async updatePhotosOrder(modelId: number, photoIds: number[]): Promise<void> {
    await this.client.put(`/admin/models/${modelId}/photos/order`, photoIds);
  }

  async setPrimaryPhoto(photoId: number): Promise<void> {
    await this.client.put(`/admin/photos/${photoId}/primary`);
  }

  async deleteModelPhoto(photoId: number): Promise<void> {
    await this.client.delete(`/admin/photos/${photoId}`);
  }

  // Управление техническими характеристиками
  async getModelSpecs(modelId: number): Promise<ModelSpec[]> {
    const response = await this.client.get(`/models/${modelId}/specs`);
    return response.data;
  }

  async createModelSpec(modelId: number, spec: ModelSpec): Promise<ModelSpec> {
    const response = await this.client.post(`/admin/models/${modelId}/specs`, spec);
    return response.data;
  }

  async updateModelSpec(specId: number, spec: Partial<ModelSpec>): Promise<ModelSpec> {
    const response = await this.client.put(`/admin/specs/${specId}`, spec);
    return response.data;
  }

  async deleteModelSpec(specId: number): Promise<void> {
    await this.client.delete(`/admin/specs/${specId}`);
  }

  async importModelSpecsFromExcel(modelId: number, file: File): Promise<{ imported: number; updated: number; total_processed: number }> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post(`/admin/models/${modelId}/specs/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async bulkUpdateModelSpecs(modelId: number, specs: ModelSpec[]): Promise<{ updated: number; created: number; total_processed: number }> {
    const response = await this.client.put(`/admin/models/${modelId}/specs/bulk`, { specs });
    return response.data;
  }

  // AI интеграция
  async classifyMotorcycleImage(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await this.client.post('/admin/ai/classify-image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  }

  async generateSalesScript(modelId: number): Promise<{ sales_script: string }> {
    const response = await this.client.post(`/admin/models/${modelId}/generate-sales-script`);
    return response.data;
  }

  // Управление новостями
  async createNews(data: Partial<News>): Promise<News> {
    const response = await this.client.post('/admin/news', data);
    return response.data;
  }

  async updateNews(id: number, data: Partial<News>): Promise<News> {
    const response = await this.client.put(`/admin/news/${id}`, data);
    return response.data;
  }

  async deleteNews(id: number): Promise<void> {
    await this.client.delete(`/admin/news/${id}`);
  }

  // Управление сотрудниками
  async createEmployee(data: Partial<Employee>): Promise<Employee> {
    const response = await this.client.post('/admin/employees', data);
    return response.data;
  }

  async updateEmployee(id: number, data: Partial<Employee>): Promise<Employee> {
    const response = await this.client.put(`/admin/employees/${id}`, data);
    return response.data;
  }

  async deleteEmployee(id: number): Promise<void> {
    await this.client.delete(`/admin/employees/${id}`);
  }

  // Управление видимостью разделов
  async updateSectionVisibility(section: keyof SectionVisibility, isVisible: boolean): Promise<void> {
    await this.client.put(`/admin/sections/${section}/visibility`, { is_visible: isVisible });
  }
}

// Создаем и экспортируем единственный экземпляр
export const apiService = new ApiService();
export default apiService; 