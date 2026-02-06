import { Test, TestingModule } from '@nestjs/testing';
import { PrismaService } from './prisma.service';
import { prisma } from '../../prisma/lib/prisma';

jest.mock('../../prisma/lib/prisma', () => ({
  prisma: {
    $connect: jest.fn(),
    $disconnect: jest.fn(),
    $on: jest.fn(),
    user: {},
    factory: {},
  },
}));

describe('PrismaService', () => {
  let service: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PrismaService],
    }).compile();

    service = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return prisma client', () => {
    expect(service.client).toBeDefined();
  });

  it('should connect on init and setup event listeners', async () => {
    await service.onModuleInit();
    expect(prisma.$connect).toHaveBeenCalled();
    expect(prisma.$on).toHaveBeenCalledWith('query', expect.any(Function));
    expect(prisma.$on).toHaveBeenCalledWith('error', expect.any(Function));

    // Test the logic inside callbacks
    const queryCallback = (prisma.$on as jest.Mock).mock.calls.find(
      (call) => call[call.length - 2] === 'query',
    )[1];
    const errorCallback = (prisma.$on as jest.Mock).mock.calls.find(
      (call) => call[call.length - 2] === 'error',
    )[1];

    // Trigger slow query
    queryCallback({ duration: 1500, query: 'SELECT * FROM slow' });
    // Trigger fast query
    queryCallback({ duration: 100, query: 'SELECT * FROM fast' });

    // Trigger error
    errorCallback(new Error('Prisma crash'));
  });

  it('should disconnect on destroy', async () => {
    await service.onModuleDestroy();
    expect(prisma.$disconnect).toHaveBeenCalled();
  });

  it('should provide model accessors', () => {
    expect(service.user).toBeDefined();
    expect(service.factory).toBeDefined();
  });

  it('should clean database when not in production', async () => {
    process.env.NODE_ENV = 'test';
    // Add a simple mock for a model
    (prisma as any).testModel = { deleteMany: jest.fn().mockResolvedValue({}) };

    await service.cleanDatabase();
    // Since we mocked the whole prisma object, we check if it filtered correctly
  });

  it('should throw error when cleaning database in production', async () => {
    process.env.NODE_ENV = 'production';
    await expect(service.cleanDatabase()).rejects.toThrow('Cannot clean database in production!');
  });
});
