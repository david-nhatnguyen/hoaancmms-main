import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

/**
 * Standard API Response Format
 */
export interface ApiResponse<T> {
    statusCode: number;
    message: string;
    data: T;
    meta?: any;
    timestamp: string;
}

/**
 * Transform Response Interceptor
 * 
 * Why we need this?
 * - Consistent response format across all endpoints
 * - Easy to parse on frontend
 * - Include metadata (timestamp, status)
 * 
 * Bad Practice: Each controller returns different format
 * ```
 * // Controller A
 * return { user: data };
 * 
 * // Controller B  
 * return data;
 * 
 * // Controller C
 * return { success: true, result: data };
 * ```
 * Result: Frontend needs different parsing logic for each endpoint
 * 
 * Best Practice: Standardized format
 * ```
 * {
 *   statusCode: 200,
 *   message: "Success",
 *   data: {...},
 *   timestamp: "2024-01-01T00:00:00.000Z"
 * }
 * ```
 * Result: Frontend always knows where to find data
 */
@Injectable()
export class TransformInterceptor<T>
    implements NestInterceptor<T, ApiResponse<T>> {
    intercept(
        context: ExecutionContext,
        next: CallHandler,
    ): Observable<ApiResponse<T>> {
        const ctx = context.switchToHttp();
        const response = ctx.getResponse();

        return next.handle().pipe(
            map((data) => ({
                statusCode: response.statusCode,
                message: data?.message || 'Success',
                data: data?.data !== undefined ? data.data : data,
                meta: data?.meta,
                timestamp: new Date().toISOString(),
            })),
        );
    }
}
