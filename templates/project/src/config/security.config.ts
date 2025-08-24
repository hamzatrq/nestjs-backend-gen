import { Module, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [SecurityConfigService],
  exports: [SecurityConfigService],
})
export class SecurityConfigModule {}

@Injectable()
export class SecurityConfigService {
  constructor(private configService: ConfigService) {}

  get corsOrigins(): string[] {
    const origins = this.configService.get<string>('CORS_ORIGINS', 'http://localhost:3000');
    return origins.split(',').map(origin => origin.trim());
  }

  get rateLimitPoints(): number {
    return this.configService.get<number>('RATE_LIMIT_POINTS', 120);
  }

  get rateLimitDuration(): number {
    return this.configService.get<number>('RATE_LIMIT_DURATION', 60);
  }

  get enableCsrf(): boolean {
    return this.configService.get<boolean>('ENABLE_CSRF', false);
  }

  get enableHelmet(): boolean {
    return this.configService.get<boolean>('ENABLE_HELMET', true);
  }
}
