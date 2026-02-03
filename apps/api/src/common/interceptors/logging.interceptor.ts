import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

/**
 * Logging Interceptor
 * 
 * Why we need this?
 * - Track all API requests/responses
 * - Monitor performance (response time)
 * - Debug issues in production
 * - Audit trail
 * 
 * What we log:
 * - Request: method, URL, user agent, IP
 * - Response: status code, time taken
 * - Performance: warn if request > 3s
 * 
 * Bad Practice: Manual logging in each controller
 * ```
 * @Get()
 * async getUsers() {
 *   console.log('Getting users...');
 *   const users = await this.service.getUsers();
 *   console.log('Users fetched');
 *   return users;
 * }
 * ```
 * Result: Inconsistent logging, easy to forget
 * 
 * Best Practice: Centralized logging via interceptor
 * - Automatic for all endpoints
 * - Consistent format
 * - No code duplication
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
    private readonly logger = new Logger('HTTP');

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        const ctx = context.switchToHttp();
        const request = ctx.getRequest<Request>();
        const { method, url, ip } = request;
        const userAgent = request.get('user-agent') || '';
        const startTime = Date.now();

        this.logger.log(
            `→ ${method} ${url} - ${ip} - ${userAgent}`,
        );

        return next.handle().pipe(
            tap({
                next: () => {
                    const response = ctx.getResponse();
                    const { statusCode } = response;
                    const responseTime = Date.now() - startTime;

                    // Warn if request is slow (> 3 seconds)
                    if (responseTime > 3000) {
                        this.logger.warn(
                            `← ${method} ${url} ${statusCode} - ${responseTime}ms ⚠️ SLOW`,
                        );
                    } else {
                        this.logger.log(
                            `← ${method} ${url} ${statusCode} - ${responseTime}ms`,
                        );
                    }
                },
                error: (error) => {
                    const responseTime = Date.now() - startTime;
                    const statusCode = error?.status || 500;

                    this.logger.error(
                        `← ${method} ${url} ${statusCode} - ${responseTime}ms - ${error?.message}`,
                    );
                },
            }),
        );
    }
}
