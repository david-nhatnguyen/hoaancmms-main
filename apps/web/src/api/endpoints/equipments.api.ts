import { apiClient } from '../client';
import type { 
    Equipment, 
    EquipmentQueryParams, 
    CreateEquipmentDto, 
    UpdateEquipmentDto,
    EquipmentStats,
    EquipmentDocument,
} from '../types/equipment.types';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';

/**
 * Equipment API Endpoints
 */
export const equipmentsApi = {
    /**
     * Get all equipments with pagination and filtering
     */
    getAll: async (params: EquipmentQueryParams): Promise<PaginatedResponse<Equipment>> => {
        return apiClient.get('/equipments', { params });
    },

    /**
     * Get equipment statistics
     */
    getStats: async (): Promise<ApiResponse<EquipmentStats>> => {
        return apiClient.get('/equipments/stats');
    },

    /**
     * Get equipment by ID
     */
    getById: async (id: string): Promise<ApiResponse<Equipment>> => {
        return apiClient.get(`/equipments/${id}`);
    },

    /**
     * Get equipment by Code
     */
    getByCode: async (code: string): Promise<ApiResponse<Equipment>> => {
        return apiClient.get(`/equipments/by-code/${code}`);
    },

    /**
     * Create new equipment
     */
    create: async (data: CreateEquipmentDto | FormData): Promise<ApiResponse<Equipment>> => {
        const config = data instanceof FormData ? { headers: { 'Content-Type': undefined } } : {};
        return apiClient.post('/equipments', data, config);
    },

    /**
     * Update equipment
     */
    update: async (id: string, data: UpdateEquipmentDto | FormData): Promise<ApiResponse<Equipment>> => {
        const config = data instanceof FormData ? { headers: { 'Content-Type': undefined } } : {};
        return apiClient.patch(`/equipments/${id}`, data, config);
    },

    /**
     * Delete equipment
     */
    delete: async (id: string): Promise<void> => {
         return apiClient.delete(`/equipments/${id}`);
    },

    /**
     * Delete multiple equipments
     */
    bulkDelete: async (ids: string[]): Promise<{ message: string; count: number }> => {
        return apiClient.post('/equipments/bulk-delete', { ids });
    },

    /**
     * Import equipments from Excel
     */
    importExcel: async (file: File): Promise<{ 
        importId: string; 
        totalRecords: number; 
        estimatedDuration: number; 
        message: string 
    }> => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post('/equipments/import', formData, {
            headers: { 'Content-Type': undefined },
        });
    },

    /**
     * Download import template
     */
    getTemplate: async (): Promise<Blob> => {
        return apiClient.get('/equipments/import/template', {
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
        return apiClient.get(`/equipments/import/${importId}`);
    },

    /**
     * Upload document
     */
    uploadDocument: async (id: string, file: File): Promise<ApiResponse<EquipmentDocument>> => {
        const formData = new FormData();
        formData.append('file', file);
        return apiClient.post(`/equipments/${id}/documents`, formData, {
            headers: { 'Content-Type': undefined },
        });
    },

    /**
     * Delete document
     */
    deleteDocument: async (docId: string): Promise<void> => {
        return apiClient.delete(`/equipments/documents/${docId}`);
    },
};
