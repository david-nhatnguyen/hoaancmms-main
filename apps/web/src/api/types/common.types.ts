/**
 * Common API Response Types
 * These match the backend NestJS response format
 */

/**
 * Standard API Response
 */
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
    timestamp: string;
}

/**
 * Paginated API Response
 */
export interface PaginatedResponse<T> {
    statusCode: number;
    message: string;
    data: T[];
    meta: PaginationMeta;
    timestamp: string;
}

/**
 * Pagination Metadata
 */
export interface PaginationMeta {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
}

/**
 * Pagination Query Parameters
 */
export interface PaginationParams {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
}

/**
 * API Error Response
 */
export interface ApiError {
    statusCode: number;
    message: string | string[];
    error?: string;
    timestamp: string;
}
