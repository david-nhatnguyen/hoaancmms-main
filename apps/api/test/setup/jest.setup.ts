// Jest setup file - runs before all tests

// Increase timeout for integration tests
jest.setTimeout(30000);

// Mock console to reduce noise in tests
global.console = {
    ...console,
    log: jest.fn(),
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};

// Setup environment variables for tests
process.env.NODE_ENV = 'test';
process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://test:test@localhost:5432/test_db';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key';
process.env.JWT_EXPIRATION = '1h';

// Global test utilities
global.testUtils = {
    delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
};
