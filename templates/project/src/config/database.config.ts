import { Module, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [DatabaseConfigService],
  exports: [DatabaseConfigService],
})
export class DatabaseConfigModule {}

@Injectable()
export class DatabaseConfigService {
  constructor(private configService: ConfigService) {}

  get databaseUrl(): string {
    return this.configService.get<string>('DATABASE_URL');
  }

  get databaseHost(): string {
    return this.configService.get<string>('DB_HOST', 'localhost');
  }

  get databasePort(): number {
    return this.configService.get<number>('DB_PORT', 5432);
  }

  get databaseName(): string {
    return this.configService.get<string>('DB_NAME', 'nestjs');
  }

  get databaseUsername(): string {
    return this.configService.get<string>('DB_USERNAME', 'postgres');
  }

  get databasePassword(): string {
    return this.configService.get<string>('DB_PASSWORD', 'postgres');
  }
}
