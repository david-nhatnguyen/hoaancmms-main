import { Controller, Get } from '@nestjs/common';
import {
  HealthCheck,
  HealthCheckService,
  PrismaHealthIndicator,
  MemoryHealthIndicator,
  DiskHealthIndicator,
} from '@nestjs/terminus';
import { PrismaService } from '../../database/prisma.service';

/**
 * Health Check Controller
 *
 * Why we need this?
 * - Kubernetes/Docker health probes
 * - Monitoring systems (Prometheus, Datadog)
 * - Load balancer health checks
 * - Quick system status overview
 *
 * Endpoints:
 * - GET /health - Overall health status
 * - GET /health/database - Database connectivity
 * - GET /health/memory - Memory usage
 * - GET /health/disk - Disk space
 *
 * Example response:
 * {
 *   "status": "ok",
 *   "info": {
 *     "database": { "status": "up" },
 *     "memory_heap": { "status": "up" },
 *     "disk": { "status": "up" }
 *   }
 * }
 */
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private prismaHealth: PrismaHealthIndicator,
    private memory: MemoryHealthIndicator,
    private disk: DiskHealthIndicator,
    private prisma: PrismaService,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // Check database connection
      () => this.prismaHealth.pingCheck('database', this.prisma.client),

      // Check memory usage (alert if > 300MB)
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),

      // Check disk space (alert if < 50% free)
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.5,
        }),
    ]);
  }

  @Get('database')
  @HealthCheck()
  checkDatabase() {
    return this.health.check([() => this.prismaHealth.pingCheck('database', this.prisma.client)]);
  }

  @Get('memory')
  @HealthCheck()
  checkMemory() {
    return this.health.check([
      () => this.memory.checkHeap('memory_heap', 300 * 1024 * 1024),
      () => this.memory.checkRSS('memory_rss', 300 * 1024 * 1024),
    ]);
  }

  @Get('disk')
  @HealthCheck()
  checkDisk() {
    return this.health.check([
      () =>
        this.disk.checkStorage('disk', {
          path: '/',
          thresholdPercent: 0.5,
        }),
    ]);
  }
}
