import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Prisma } from '../../../prisma/generated/prisma/client';

/**
 * Global Exception Filter
 * 
 * Why we need this?
 * - Standardize error response format across entire API
 * - Hide internal implementation details from clients
 * - Log errors for debugging
 * - Handle different error types (HTTP, Prisma, Validation, Unknown)
 * 
 * Bad Practice: Let NestJS return raw errors
 * - Leaks stack traces to clients (security risk)
 * - Inconsistent error format
 * - Hard to parse on frontend
 * 
 * Best Practice: Centralized error handling
 * - Consistent response format
 * - Proper HTTP status codes
 * - Sanitized error messages
 * - Detailed logging for debugging
 */
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message = 'Internal server error';
        let errors: any = null;

        // 1. Handle NestJS HTTP Exceptions
        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === 'object') {
                message = (exceptionResponse as any).message || message;
                errors = (exceptionResponse as any).errors || null;
            }
        }
        // 2. Handle Prisma Errors
        else if (exception instanceof Prisma.PrismaClientKnownRequestError) {
            status = HttpStatus.BAD_REQUEST;

            switch (exception.code) {
                case 'P2002':
                    // Unique constraint violation
                    const target = (exception.meta?.target as string[]) || [];
                    message = `Duplicate entry for ${target.join(', ')}`;
                    break;
                case 'P2025':
                    // Record not found
                    message = 'Record not found';
                    status = HttpStatus.NOT_FOUND;
                    break;
                case 'P2003':
                    // Foreign key constraint failed
                    message = 'Related record not found';
                    break;
                default:
                    message = 'Database operation failed';
            }

            this.logger.error(`Prisma Error [${exception.code}]:`, exception.message);
        }
        // 3. Handle Prisma Validation Errors
        else if (exception instanceof Prisma.PrismaClientValidationError) {
            status = HttpStatus.BAD_REQUEST;
            message = 'Invalid data provided';
            this.logger.error('Prisma Validation Error:', exception.message);
        }
        // 4. Handle Unknown Errors
        else if (exception instanceof Error) {
            message = exception.message;
            this.logger.error('Unhandled Error:', exception.stack);
        }

        // Build standardized error response
        const errorResponse = {
            statusCode: status,
            message,
            errors,
            timestamp: new Date().toISOString(),
            path: request.url,
            method: request.method,
        };

        // Log error details (but not in response to client)
        if (status >= 500) {
            this.logger.error(
                `${request.method} ${request.url}`,
                JSON.stringify(errorResponse),
            );
        } else {
            this.logger.warn(
                `${request.method} ${request.url}`,
                JSON.stringify(errorResponse),
            );
        }

        response.status(status).json(errorResponse);
    }
}
