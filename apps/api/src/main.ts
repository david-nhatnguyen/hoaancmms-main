import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as compression from 'compression';
import helmet from 'helmet';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';
import { TimeoutInterceptor } from './common/interceptors/timeout.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 1. Security & Optimization
  app.enableCors({
    origin: [
      'http://localhost:5173',  // Vite default
      'http://localhost:3001',  // Current frontend
      configService.get('CORS_ORIGIN') || 'http://localhost:5173'
    ],
    credentials: true,
  });
  app.use(helmet());
  app.use(compression());

  // 2. Global Prefix & Versioning
  app.setGlobalPrefix('api');

  // 3. Global Exception Filter (must be first)
  app.useGlobalFilters(new AllExceptionsFilter());

  // 4. Global Interceptors (order matters!)
  app.useGlobalInterceptors(
    new LoggingInterceptor(),      // Log first
    new TimeoutInterceptor(),      // Then check timeout
    new TransformInterceptor(),    // Finally transform response
  );

  // 5. Validation Pipe (auto-validate DTOs)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,              // Strip unknown properties
      transform: true,              // Auto-transform types
      forbidNonWhitelisted: true,   // Throw error on unknown properties
      transformOptions: {
        enableImplicitConversion: true, // Auto-convert primitives
      },
    }),
  );

  // 6. Swagger API Documentation
  const config = new DocumentBuilder()
    .setTitle('CMMS API')
    .setDescription('Computerized Maintenance Management System API Documentation')
    .setVersion('1.0')
    .addTag('auth', 'Authentication endpoints')
    .addTag('users', 'User management')
    .addTag('factories', 'Factory management')
    .addTag('equipments', 'Equipment management')
    .addTag('health', 'Health check endpoints')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter JWT token',
      },
      'JWT-auth',
    )
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    swaggerOptions: {
      persistAuthorization: true,
      tagsSorter: 'alpha',
      operationsSorter: 'alpha',
    },
  });

  // 7. Start Server
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);

  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
  logger.log(`📚 Swagger docs available at: http://localhost:${port}/api/docs`);
  logger.log(`🏥 Health check available at: http://localhost:${port}/api/health`);
  logger.log(`📊 Environment: ${configService.get('NODE_ENV')}`);
}
bootstrap();
