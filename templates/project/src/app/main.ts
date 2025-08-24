import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { setupVersioning } from './bootstrap/versioning';
import { setupSecurity } from './bootstrap/security';
import { setupSwagger } from './bootstrap/swagger';
import { setupLogger } from './bootstrap/logger';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  
  const configService = app.get(ConfigService);
  
  setupLogger(app);
  setupVersioning(app);
  await setupSecurity(app);
  setupSwagger(app);
  
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 Application is running on: http://localhost:${port}`);
  console.log(`📚 Swagger documentation: http://localhost:${port}/docs`);
  console.log(`🏥 Health check: http://localhost:${port}/health`);
}

bootstrap();
