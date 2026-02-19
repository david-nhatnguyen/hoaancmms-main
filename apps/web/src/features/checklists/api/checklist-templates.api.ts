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

  /**
   * Import checklist templates from Excel
   */
  importExcel: async (file: File): Promise<{
    importId: string;
    totalRecords: number;
    estimatedDuration: number;
    message: string;
  }> => {
    const formData = new FormData();
    formData.append('file', file);
    return apiClient.post('/checklist-templates/import', formData, {
      headers: { 'Content-Type': undefined },
    });
  },

  /**
   * Download import template file
   */
  getTemplate: async (): Promise<Blob> => {
    return apiClient.get('/checklist-templates/import/template', {
      responseType: 'blob',
    });
  },

  /**
   * Get import job status
   */
  getImportStatus: async (importId: string): Promise<{
    id: string;
    fileName: string;
    totalRecords: number;
    processedRecords: number;
    successCount: number;
    failedCount: number;
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    errorFileUrl?: string;
  }> => {
    return apiClient.get(`/checklist-templates/import/${importId}`);
  },
};
