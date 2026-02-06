import { ExecutionContext, CallHandler, RequestTimeoutException } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { TimeoutInterceptor } from './timeout.interceptor';

describe('TimeoutInterceptor', () => {
  let interceptor: TimeoutInterceptor;

  beforeEach(() => {
    interceptor = new TimeoutInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should allow requests that complete within timeout', (done) => {
    const mockContext = {
      getHandler: () => ({}),
    } as ExecutionContext;
    const mockCallHandler = {
      handle: () => of('data').pipe(delay(10)),
    } as CallHandler;

    // Use a small custom timeout for testing
    jest.spyOn(Reflect, 'getMetadata').mockReturnValue(100);

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (data) => {
        expect(data).toBe('data');
        done();
      },
      error: done,
    });
  });

  it('should throw RequestTimeoutException when request times out', (done) => {
    const mockContext = {
      getHandler: () => ({}),
    } as ExecutionContext;

    // Create an observable that never completes or takes too long
    const mockCallHandler = {
      handle: () => of('data').pipe(delay(200)),
    } as CallHandler;

    // Set a very short timeout
    jest.spyOn(Reflect, 'getMetadata').mockReturnValue(50);

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done('Should have timed out'),
      error: (error) => {
        expect(error).toBeInstanceOf(RequestTimeoutException);
        expect(error.message).toContain('timeout after 50ms');
        done();
      },
    });
  });

  it('should pass through non-timeout errors', (done) => {
    const mockContext = {
      getHandler: () => ({}),
    } as ExecutionContext;

    const mockError = new Error('Other error');
    const mockCallHandler = {
      handle: () => throwError(() => mockError),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: () => done('Should have failed'),
      error: (error) => {
        expect(error).toBe(mockError);
        done();
      },
    });
  });
});
