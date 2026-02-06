import type { PaginationParams } from './common.types';

/**
 * Factory Status Enum
 * Matches backend FactoryStatus enum
 */
export type FactoryStatus = 'ACTIVE' | 'INACTIVE';

/**
 * Factory Entity
 * Matches backend Factory model
 */
export interface Factory {
    id: string;
    code: string;
    name: string;
    location: string | null;
    equipmentCount: number;
    status: FactoryStatus;
    createdAt: string;
    updatedAt: string;
}

/**
 * Create Factory DTO
 * Matches backend CreateFactoryDto
 */
export interface CreateFactoryDto {
    code: string;
    name: string;
    location?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}

/**
 * Update Factory DTO
 * Matches backend UpdateFactoryDto
 */
export interface UpdateFactoryDto {
    code?: string;
    name?: string;
    location?: string;
    status?: 'ACTIVE' | 'INACTIVE';
}

/**
 * Factory Query Parameters
 * Matches backend FactoryQueryDto
 */
export interface FactoryQueryParams extends PaginationParams {
    status?: 'ACTIVE' | 'INACTIVE';
    search?: string;
}

/**
 * Factory Statistics
 * Matches backend FactoryStats
 */
export interface FactoryStats {
    totalFactories: number;
    activeFactories: number;
    totalEquipment: number;
}

/**
 * Factory Response (for forms/display)
 */
export interface FactoryFormData {
    code: string;
    name: string;
    location: string;
}
