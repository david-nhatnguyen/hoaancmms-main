import { Test, TestingModule } from '@nestjs/testing';
import {
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { HealthController } from './health.controller';
import { PrismaService } from '../../database/prisma.service';

describe('HealthController', () => {
  let controller: HealthController;
  let prismaHealth: PrismaHealthIndicator;
  let memoryHealth: MemoryHealthIndicator;
  let diskHealth: DiskHealthIndicator;
  let health: HealthCheckService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [
        {
          provide: HealthCheckService,
          useValue: { check: jest.fn((checks) => Promise.all(checks.map((c) => c()))) },
        },
        {
          provide: PrismaHealthIndicator,
          useValue: { pingCheck: jest.fn().mockResolvedValue({ status: 'up' }) },
        },
        {
          provide: MemoryHealthIndicator,
          useValue: {
            checkHeap: jest.fn().mockResolvedValue({ status: 'up' }),
            checkRSS: jest.fn().mockResolvedValue({ status: 'up' }),
          },
        },
        {
          provide: DiskHealthIndicator,
          useValue: { checkStorage: jest.fn().mockResolvedValue({ status: 'up' }) },
        },
        {
          provide: PrismaService,
          useValue: { client: {} },
        },
      ],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    prismaHealth = module.get<PrismaHealthIndicator>(PrismaHealthIndicator);
    memoryHealth = module.get<MemoryHealthIndicator>(MemoryHealthIndicator);
    diskHealth = module.get<DiskHealthIndicator>(DiskHealthIndicator);
    health = module.get<HealthCheckService>(HealthCheckService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should check overall health', async () => {
    await controller.check();
    expect(health.check).toHaveBeenCalled();
    expect(prismaHealth.pingCheck).toHaveBeenCalled();
    expect(memoryHealth.checkHeap).toHaveBeenCalled();
    expect(diskHealth.checkStorage).toHaveBeenCalled();
  });

  it('should check database health', async () => {
    await controller.checkDatabase();
    expect(prismaHealth.pingCheck).toHaveBeenCalled();
  });

  it('should check memory health', async () => {
    await controller.checkMemory();
    expect(memoryHealth.checkHeap).toHaveBeenCalled();
    expect(memoryHealth.checkRSS).toHaveBeenCalled();
  });

  it('should check disk health', async () => {
    await controller.checkDisk();
    expect(diskHealth.checkStorage).toHaveBeenCalled();
  });
});
