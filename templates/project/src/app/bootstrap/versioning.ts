import { INestApplication, VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export function setupVersioning(app: INestApplication): void {
  const configService = app.get(ConfigService);
  const apiPrefix = configService.get('API_PREFIX', '/api');
  const apiVersion = configService.get('API_VERSION', 'v1');

  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: apiVersion,
    prefix: apiPrefix,
  });
}
