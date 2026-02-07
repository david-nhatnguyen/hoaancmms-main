import { apiClient } from '../client';
import type { 
    Equipment, 
    EquipmentQueryParams, 
    CreateEquipmentDto, 
    UpdateEquipmentDto,
    EquipmentStats
} from '../types/equipment.types';
import type { PaginatedResponse } from '../types/common.types';

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
    getStats: async (): Promise<EquipmentStats> => {
        return apiClient.get('/equipments/stats');
    },

    /**
     * Get equipment by ID
     */
    getById: async (id: string): Promise<Equipment> => {
        return apiClient.get(`/equipments/${id}`);
    },

    /**
     * Create new equipment
     */
    create: async (data: CreateEquipmentDto): Promise<Equipment> => {
        return apiClient.post('/equipments', data);
    },

    /**
     * Update equipment
     */
    update: async (id: string, data: UpdateEquipmentDto): Promise<Equipment> => {
        return apiClient.patch(`/equipments/${id}`, data);
    },

    /**
     * Delete equipment
     */
    delete: async (id: string): Promise<void> => {
         return apiClient.delete(`/equipments/${id}`);
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
            headers: { 'Content-Type': 'multipart/form-data' },
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
    }
};
