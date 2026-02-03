import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { prisma } from '../../prisma/lib/prisma';

/**
 * PrismaService - Centralized database client wrapper
 * 
 * Why use a centralized Prisma instance?
 * - Single database connection pool (better performance)
 * - Consistent configuration across the app
 * - Easier to mock in tests
 * 
 * Why implement OnModuleInit/OnModuleDestroy?
 * - Proper connection lifecycle management
 * - Graceful shutdown (important for Docker/K8s)
 * - Prevents connection leaks
 */
@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PrismaService.name);

  // Expose the Prisma client for use in services
  get client() {
    return prisma;
  }

  async onModuleInit() {
    this.logger.log('Connecting to database...');
    await prisma.$connect();
    this.logger.log('✅ Database connected');

    // Log slow queries (> 1s) for performance monitoring
    // @ts-ignore - Prisma event types
    prisma.$on('query', (e: any) => {
      if (e.duration > 1000) {
        this.logger.warn(`Slow query detected (${e.duration}ms): ${e.query}`);
      }
    });

    // @ts-ignore
    prisma.$on('error', (e: any) => {
      this.logger.error('Prisma error:', e);
    });
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await prisma.$disconnect();
    this.logger.log('✅ Database disconnected');
  }

  /**
   * Clean database (useful for testing)
   * ⚠️ NEVER call this in production!
   */
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Cannot clean database in production!');
    }

    const models = Reflect.ownKeys(prisma).filter(
      (key) => key[0] !== '_' && key !== 'constructor',
    );

    return Promise.all(
      models.map((modelKey) => {
        // @ts-ignore
        return prisma[modelKey].deleteMany?.();
      }),
    );
  }

  // Proxy all Prisma methods for backward compatibility
  get user() { return prisma.user; }
  get factory() { return prisma.factory; }
  // Add more models as needed
}