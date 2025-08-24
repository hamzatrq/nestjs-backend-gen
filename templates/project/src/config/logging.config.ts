import { Module, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [LoggingConfigService],
  exports: [LoggingConfigService],
})
export class LoggingConfigModule {}

@Injectable()
export class LoggingConfigService {
  constructor(private configService: ConfigService) {}

  get logLevel(): string {
    return this.configService.get<string>('LOG_LEVEL', 'info');
  }

  get logDestination(): string {
    return this.configService.get<string>('LOG_DESTINATION', 'console');
  }

  get logFilePath(): string {
    return this.configService.get<string>('LOG_FILE_PATH', 'logs/app.log');
  }

  get enableSentry(): boolean {
    return this.configService.get<boolean>('ENABLE_SENTRY', false);
  }

  get sentryDsn(): string {
    return this.configService.get<string>('SENTRY_DSN');
  }
}
