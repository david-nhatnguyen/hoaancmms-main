import { ExecutionContext, CallHandler } from '@nestjs/common';
import { of } from 'rxjs';
import { TransformInterceptor } from './transform.interceptor';

describe('TransformInterceptor', () => {
  let interceptor: TransformInterceptor<any>;

  beforeEach(() => {
    interceptor = new TransformInterceptor();
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });

  it('should transform response correctly', (done) => {
    const mockData = { id: 1, name: 'Test' };
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(mockData),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.statusCode).toBe(200);
        expect(response.message).toBe('Success');
        expect(response.data).toEqual(mockData);
        expect(response.timestamp).toBeDefined();
        done();
      },
      error: done,
    });
  });

  it('should use message and meta from data if provided', (done) => {
    const mockData = {
      data: { id: 1 },
      message: 'Custom Message',
      meta: { total: 10 },
    };
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 201 }),
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(mockData),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.statusCode).toBe(201);
        expect(response.message).toBe('Custom Message');
        expect(response.data).toEqual(mockData.data);
        expect(response.meta).toEqual(mockData.meta);
        done();
      },
      error: done,
    });
  });

  it('should handle null data', (done) => {
    const mockData = null;
    const mockContext = {
      switchToHttp: () => ({
        getResponse: () => ({ statusCode: 200 }),
      }),
    } as ExecutionContext;

    const mockCallHandler = {
      handle: () => of(mockData),
    } as CallHandler;

    interceptor.intercept(mockContext, mockCallHandler).subscribe({
      next: (response) => {
        expect(response.statusCode).toBe(200);
        expect(response.message).toBe('Success');
        expect(response.data).toBe(null);
        done();
      },
      error: done,
    });
  });
});
