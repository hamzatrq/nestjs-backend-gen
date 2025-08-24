import { INestApplication, ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as helmet from 'helmet';
import * as rateLimit from 'express-rate-limit';
import * as compression from 'compression';

export async function setupSecurity(app: INestApplication): Promise<void> {
  const configService = app.get(ConfigService);

  // Helmet for security headers
  app.use(helmet());

  // CORS configuration
  const corsOrigins = configService.get('CORS_ORIGINS', 'http://localhost:3000');
  app.enableCors({
    origin: corsOrigins.split(',').map(origin => origin.trim()),
    credentials: true,
  });

  // Rate limiting
  const rateLimitPoints = configService.get('RATE_LIMIT_POINTS', 120);
  const rateLimitDuration = configService.get('RATE_LIMIT_DURATION', 60);
  
  app.use(
    rateLimit({
      windowMs: rateLimitDuration * 1000,
      max: rateLimitPoints,
      message: 'Too many requests from this IP, please try again later.',
    }),
  );

  // Compression
  app.use(compression());

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
}
