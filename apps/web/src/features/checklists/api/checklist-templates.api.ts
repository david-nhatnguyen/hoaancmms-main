import { apiClient } from '@/api/client';
import type {
  ChecklistTemplate,
  CreateTemplateDto,
  UpdateTemplateDto,
  QueryTemplateParams,
  ChecklistTemplateListResponse,
  ApiResponse,
} from '../types/checklist.types';

/**
 * Checklist Templates API
 * Follows factories.api.ts pattern
 */
export const checklistTemplatesApi = {
  /**
   * Get all templates with pagination and filtering
   */
  getAll: async (params?: QueryTemplateParams): Promise<ChecklistTemplateListResponse> => {
    return apiClient.get('/checklist-templates', { params });
  },

  /**
   * Get a single template by ID
   */
  getById: async (id: string): Promise<ApiResponse<ChecklistTemplate>> => {
    return apiClient.get(`/checklist-templates/${id}`);
  },

  /**
   * Create a new template
   */
  create: async (data: CreateTemplateDto): Promise<ApiResponse<ChecklistTemplate>> => {
    return apiClient.post('/checklist-templates', data);
  },

  /**
   * Update a template
   */
  update: async (
    id: string,
    data: UpdateTemplateDto
  ): Promise<ApiResponse<ChecklistTemplate>> => {
    return apiClient.put(`/checklist-templates/${id}`, data);
  },

  /**
   * Delete a template
   */
  delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
    return apiClient.delete(`/checklist-templates/${id}`);
  },

  /**
   * Delete multiple templates
   */
  bulkDelete: async (ids: string[]): Promise<ApiResponse<{ message: string; success: string[]; failed: any[] }>> => {
    return apiClient.post('/checklist-templates/bulk-delete', { ids });
  },

  /**
   * Activate a template
   */
  activate: async (id: string): Promise<ApiResponse<ChecklistTemplate>> => {
    return apiClient.post(`/checklist-templates/${id}/activate`);
  },

  /**
   * Deactivate a template
   */
  deactivate: async (id: string): Promise<ApiResponse<ChecklistTemplate>> => {
    return apiClient.post(`/checklist-templates/${id}/deactivate`);
  },

  /**
   * Duplicate a template
   */
  duplicate: async (id: string): Promise<ApiResponse<ChecklistTemplate>> => {
    return apiClient.post(`/checklist-templates/${id}/duplicate`);
  },
};
