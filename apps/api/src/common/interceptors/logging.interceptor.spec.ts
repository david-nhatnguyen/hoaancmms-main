import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { LoggingInterceptor } from './logging.interceptor';

describe('LoggingInterceptor', () => {
  let interceptor: LoggingInterceptor;

  beforeEach(() => {
    interceptor = new LoggingInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should log request and response', (done) => {
    const mockRequest = {
      method: 'GET',
      url: '/test',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('jest-test'),
    };
    const mockResponse = { statusCode: 200 };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of('test-data'),
    } as CallHandler;

    // We can't easily check the logger output as it's private and uses Nest Logger
    // but we can ensure the observable completes
    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (data) => {
        expect(data).toBe('test-data');
        done();
      },
      error: done,
    });
  });

  it('should log slow request warning', (done) => {
    const mockRequest = {
      method: 'GET',
      url: '/slow',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('jest-test'),
    };
    const mockResponse = { statusCode: 200 };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => mockResponse,
      }),
    } as unknown as ExecutionContext;

    const mockCallHandler = {
      handle: () => of('slow-data').pipe(delay(3100)),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (data) => {
        expect(data).toBe('slow-data');
        done();
      },
      error: done,
    });
  });

  it('should log error response', (done) => {
    const mockRequest = {
      method: 'POST',
      url: '/error',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue('jest-test'),
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const mockError = { status: 400, message: 'Bad Request' };
    const mockCallHandler = {
      handle: () => throwError(() => mockError),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      error: (error) => {
        expect(error).toBe(mockError);
        done();
      },
    });
  });

  it('should handle missing user-agent and generic error', (done) => {
    const mockRequest = {
      method: 'GET',
      url: '/generic-error',
      ip: '127.0.0.1',
      get: jest.fn().mockReturnValue(undefined), // No user-agent
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
        getResponse: () => ({}),
      }),
    } as unknown as ExecutionContext;

    const mockError = {}; // No status, no message
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
