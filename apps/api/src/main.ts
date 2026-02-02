import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import helmet from 'helmet';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  // 1. Security & Optimization
  app.enableCors(); // Cấu hình kỹ hơn khi lên Prod
  app.use(helmet());
  app.use(compression());

  // 2. Global Prefix & Versioning
  app.setGlobalPrefix('api');

  // 3. Validation Pipe (Tự động validate DTO)
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Loại bỏ các field không định nghĩa trong DTO
      transform: true, // Tự động convert type (vd: string '1' -> number 1)
      forbidNonWhitelisted: true, // Báo lỗi nếu gửi thừa field
    }),
  );

  // 4. Start Server
  const port = configService.get<number>('PORT') || 3000;
  await app.listen(port);
  logger.log(`🚀 Application is running on: http://localhost:${port}/api`);
}
bootstrap();
