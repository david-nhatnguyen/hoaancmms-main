import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './database/prisma.module';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { QueueModule } from './modules/queue/queue.module';
import { FactoriesModule } from './modules/factories/factories.module';

@Module({
  imports: [
    // Best Practice: Validate Env Vars ngay khi khởi động
    ConfigModule.forRoot({
      isGlobal: true, // Dùng được ở mọi module khác mà không cần import lại
      validationSchema: Joi.object({
        NODE_ENV: Joi.string()
          .valid('development', 'production', 'test')
          .default('development'),
        PORT: Joi.number().default(3000),
        DATABASE_URL: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRATION: Joi.string().default('1d'),
        CORS_ORIGIN: Joi.string().default('http://localhost:5173'),

        // Redis Configuration (for BullMQ)
        REDIS_HOST: Joi.string().default('localhost'),
        REDIS_PORT: Joi.number().default(6379),
      }),
    }),
    PrismaModule,
    QueueModule, // BullMQ for async processing
    UsersModule,
    AuthModule,
    HealthModule,
    FactoriesModule, // Factory CRUD API
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }


