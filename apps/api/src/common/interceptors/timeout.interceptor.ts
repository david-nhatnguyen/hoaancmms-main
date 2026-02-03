import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
    RequestTimeoutException,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

/**
 * Timeout Interceptor
 * 
 * Why we need this?
 * - Prevent requests from hanging forever
 * - Protect against slow database queries
 * - Improve user experience (fail fast)
 * - Prevent resource exhaustion
 * 
 * Bad Practice: No timeout
 * - Request hangs for minutes
 * - User waits indefinitely
 * - Server resources locked
 * 
 * Best Practice: Set reasonable timeout
 * - Default: 30 seconds (configurable per endpoint)
 * - Fail fast with clear error message
 * - Free up resources
 * 
 * How to customize timeout per endpoint:
 * ```
 * @SetMetadata('timeout', 60000) // 60 seconds
 * @Get('/slow-operation')
 * async slowOperation() { ... }
 * ```
 */
@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
    private readonly defaultTimeout = 30000; // 30 seconds

    intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
        // Get custom timeout from metadata if set
        const customTimeout = Reflect.getMetadata(
            'timeout',
            context.getHandler(),
        );
        const timeoutValue = customTimeout || this.defaultTimeout;

        return next.handle().pipe(
            timeout(timeoutValue),
            catchError((err) => {
                if (err instanceof TimeoutError) {
                    return throwError(
                        () =>
                            new RequestTimeoutException(
                                `Request timeout after ${timeoutValue}ms`,
                            ),
                    );
                }
                return throwError(() => err);
            }),
        );
    }
}
