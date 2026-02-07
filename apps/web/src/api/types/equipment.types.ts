import type { PaginationParams } from './common.types';

/**
 * Equipment Status Enum
 */
export type EquipmentStatus = 'ACTIVE' | 'MAINTENANCE' | 'INACTIVE';

/**
 * Equipment Entity
 */
export interface Equipment {
    id: string;
    code: string;
    name: string; // List of machine
    factoryId?: string;
    factoryName?: string; // Derived from relation
    category: string; // Type of machine
    origin?: string; // Original
    brand?: string; // Trademark
    modelYear?: number; // Model year
    image?: string; // Picture
    dimension?: string; // Dimension
    quantity: number; // Quantity
    status: EquipmentStatus;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

/**
 * Create Equipment DTO
 */
export interface CreateEquipmentDto {
    code: string;
    name: string;
    category: string;
    factoryId?: string;
    origin?: string;
    brand?: string;
    modelYear?: number;
    image?: string;
    dimension?: string;
    quantity?: number;
    status?: EquipmentStatus;
    notes?: string;
}

/**
 * Update Equipment DTO
 */
export interface UpdateEquipmentDto extends Partial<CreateEquipmentDto> {}

/**
 * Equipment Query Parameters
 */
export interface EquipmentQueryParams extends PaginationParams {
    search?: string;
    factoryId?: string;
    status?: EquipmentStatus[];
}

/**
 * Equipment Statistics
 */
export interface EquipmentStats {
    totalEquipments: number;
    active: number;
    maintenance: number;
    inactive: number;
}
