import { apiClient } from '../client';
import type {
    Factory,
    CreateFactoryDto,
    UpdateFactoryDto,
    FactoryQueryParams,
    FactoryStats,
} from '../types/factory.types';
import type { ApiResponse, PaginatedResponse } from '../types/common.types';

/**
 * Factory API Endpoints
 * All CRUD operations for factories
 */
export const factoriesApi = {
    /**
     * Get all factories with pagination and filters
     */
    getAll: async (params?: FactoryQueryParams): Promise<PaginatedResponse<Factory>> => {
        return apiClient.get('/factories', { params });
    },

    /**
     * Get factory by ID
     */
    getById: async (id: string): Promise<ApiResponse<Factory>> => {
        return apiClient.get(`/factories/${id}`);
    },

    /**
     * Create new factory
     */
    create: async (data: CreateFactoryDto): Promise<ApiResponse<Factory>> => {
        return apiClient.post('/factories', data);
    },

    /**
     * Update existing factory
     */
    update: async (id: string, data: UpdateFactoryDto): Promise<ApiResponse<Factory>> => {
        return apiClient.patch(`/factories/${id}`, data);
    },

    /**
     * Delete factory
     */
    delete: async (id: string): Promise<ApiResponse<{ message: string }>> => {
        return apiClient.delete(`/factories/${id}`);
    },

    /**
     * Delete multiple factories
     */
    bulkDelete: async (ids: string[]): Promise<ApiResponse<{ message: string; success: string[]; failed: any[] }>> => {
        return apiClient.post('/factories/bulk-delete', { ids });
    },

    /**
     * Get factory statistics
     */
    getStats: async (): Promise<ApiResponse<FactoryStats>> => {
        return apiClient.get('/factories/stats');
    },
};
