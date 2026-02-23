import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { CustomValidationPipe } from './common/pipes/validation.pipe';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ErrorLoggerService } from './common/logger/error-logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const errorLogger = app.get(ErrorLoggerService);

  app.useGlobalPipes(new CustomValidationPipe());

  app.useGlobalFilters(new AllExceptionsFilter(errorLogger));

  // Enable CORS
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  });

  // Global prefix
  app.setGlobalPrefix('api');

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`Application running on: http://localhost:${port}/api`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}
bootstrap();
