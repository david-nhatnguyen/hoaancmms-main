import axios from 'axios';
import type {
  ChecklistTemplate,
  CreateTemplateDto,
  UpdateTemplateDto,
  QueryTemplateParams,
  ChecklistTemplateListResponse,
  ChecklistTemplateResponse,
} from '../types/checklist.types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1';

// Create axios instance with auth token
const apiClient = axios.create({
  baseURL: API_BASE_URL,
});

// Add auth token to requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * Checklist Templates API Client
 */
export const checklistTemplatesApi = {
  /**
   * Get all templates with filtering and pagination
   */
  getAll: async (
    params?: QueryTemplateParams
  ): Promise<ChecklistTemplateListResponse> => {
    const response = await apiClient.get<ChecklistTemplateListResponse>(
      '/checklist-templates',
      { params }
    );
    return response.data;
  },

  /**
   * Get a single template by ID
   */
  getById: async (id: string): Promise<ChecklistTemplateResponse> => {
    const response = await apiClient.get<ChecklistTemplateResponse>(
      `/checklist-templates/${id}`
    );
    return response.data;
  },

  /**
   * Create a new template
   */
  create: async (data: CreateTemplateDto): Promise<ChecklistTemplateResponse> => {
    const response = await apiClient.post<ChecklistTemplateResponse>(
      '/checklist-templates',
      data
    );
    return response.data;
  },

  /**
   * Update a template
   */
  update: async (
    id: string,
    data: UpdateTemplateDto
  ): Promise<ChecklistTemplateResponse> => {
    const response = await apiClient.put<ChecklistTemplateResponse>(
      `/checklist-templates/${id}`,
      data
    );
    return response.data;
  },

  /**
   * Delete a template
   */
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/checklist-templates/${id}`);
  },

  /**
   * Activate a template
   */
  activate: async (id: string): Promise<ChecklistTemplateResponse> => {
    const response = await apiClient.post<ChecklistTemplateResponse>(
      `/checklist-templates/${id}/activate`
    );
    return response.data;
  },

  /**
   * Deactivate a template
   */
  deactivate: async (id: string): Promise<ChecklistTemplateResponse> => {
    const response = await apiClient.post<ChecklistTemplateResponse>(
      `/checklist-templates/${id}/deactivate`
    );
    return response.data;
  },

  /**
   * Duplicate a template
   */
  duplicate: async (id: string): Promise<ChecklistTemplateResponse> => {
    const response = await apiClient.post<ChecklistTemplateResponse>(
      `/checklist-templates/${id}/duplicate`
    );
    return response.data;
  },
};
