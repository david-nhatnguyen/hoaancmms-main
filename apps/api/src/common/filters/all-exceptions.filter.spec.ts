import { HttpException, HttpStatus } from '@nestjs/common';
import { AllExceptionsFilter } from './all-exceptions.filter';
import { Prisma } from '../../../prisma/generated/prisma/client';

describe('AllExceptionsFilter', () => {
  let filter: AllExceptionsFilter;
  let mockResponse: any;
  let mockRequest: any;
  let mockArgumentsHost: any;

  beforeEach(() => {
    filter = new AllExceptionsFilter();
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockRequest = {
      url: '/test',
      method: 'GET',
    };
    mockArgumentsHost = {
      switchToHttp: jest.fn().mockReturnThis(),
      getResponse: jest.fn().mockReturnValue(mockResponse),
      getRequest: jest.fn().mockReturnValue(mockRequest),
    };
  });

  it('should handle HttpException', () => {
    const exception = new HttpException('Test Message', HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.BAD_REQUEST,
        message: 'Test Message',
        path: '/test',
      }),
    );
  });

  it('should handle Prisma P2002 error', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Duplicate key', {
      code: 'P2002',
      clientVersion: '1.0',
      meta: { target: ['email'] },
    });
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Duplicate entry for email',
      }),
    );
  });

  it('should handle HttpException with object response containing message and errors', () => {
    const exceptionResponse = { message: 'Custom Error', errors: ['error1', 'error2'] };
    const exception = new HttpException(exceptionResponse, HttpStatus.UNPROCESSABLE_ENTITY);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.UNPROCESSABLE_ENTITY);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Custom Error',
        errors: ['error1', 'error2'],
      }),
    );
  });

  it('should handle HttpException with object response missing message', () => {
    const exceptionResponse = { foo: 'bar' };
    const exception = new HttpException(exceptionResponse, HttpStatus.BAD_REQUEST);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Internal server error', // Defaults to initial message
      }),
    );
  });

  it('should handle Prisma P2025 error (Record not found)', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Record not found', {
      code: 'P2025',
      clientVersion: '1.0',
    });
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Record not found',
      }),
    );
  });

  it('should handle Prisma P2003 error (Foreign key)', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('FK error', {
      code: 'P2003',
      clientVersion: '1.0',
    });
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Related record not found',
      }),
    );
  });

  it('should handle PrismaClientValidationError', () => {
    // Mock the constructor instead of calling the real one which requires complex arguments
    const exception = Object.create(Prisma.PrismaClientValidationError.prototype);
    exception.message = 'Validation error';

    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Invalid data provided',
      }),
    );
  });

  it('should handle HttpException with string response', () => {
    const exception = new HttpException('String Message', HttpStatus.FORBIDDEN);
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.FORBIDDEN);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'String Message' }),
    );
  });

  it('should handle Prisma error with unknown code', () => {
    const exception = new Prisma.PrismaClientKnownRequestError('Unknown prisma error', {
      code: 'PXXXX',
      clientVersion: '1.0',
    });
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({ message: 'Database operation failed' }),
    );
  });

  it('should handle common Error', () => {
    const exception = new Error('Unexpected error');
    filter.catch(exception, mockArgumentsHost);

    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.INTERNAL_SERVER_ERROR);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: 'Unexpected error',
      }),
    );
  });
});
