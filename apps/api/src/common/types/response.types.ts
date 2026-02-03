/**
 * Standard API Response Interface
 * 
 * Why use a standard response format?
 * - Frontend can handle responses consistently
 * - Easier to write interceptors
 * - Better error handling
 * - Swagger documentation is clearer
 * 
 * Bad Practice:
 * return { data: users }; // Inconsistent
 * return users; // No metadata
 * 
 * Best Practice:
 * return {
 *   statusCode: 200,
 *   message: 'Success',
 *   data: users,
 *   timestamp: new Date().toISOString()
 * };
 */
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data?: T;
    timestamp: string;
}

/**
 * Paginated Response Interface
 * 
 * Why separate from ApiResponse?
 * - Pagination metadata is different from regular responses
 * - Type safety for paginated data
 */
export interface PaginatedResponse<T> extends ApiResponse<T[]> {
    meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

/**
 * Error Response Interface
 */
export interface ErrorResponse {
    statusCode: number;
    message: string;
    error?: string;
    timestamp: string;
    path?: string;
}
