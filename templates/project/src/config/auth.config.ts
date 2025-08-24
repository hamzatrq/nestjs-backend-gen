import { Module, Injectable } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  providers: [AuthConfigService],
  exports: [AuthConfigService],
})
export class AuthConfigModule {}

@Injectable()
export class AuthConfigService {
  constructor(private configService: ConfigService) {}

  get jwtSecret(): string {
    return this.configService.get<string>('JWT_SECRET');
  }

  get jwtExpiresIn(): string {
    return this.configService.get<string>('JWT_EXPIRES_IN', '1d');
  }

  get googleClientId(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_ID');
  }

  get googleClientSecret(): string {
    return this.configService.get<string>('GOOGLE_CLIENT_SECRET');
  }

  get googleCallbackUrl(): string {
    return this.configService.get<string>('GOOGLE_CALLBACK_URL');
  }

  get microsoftClientId(): string {
    return this.configService.get<string>('MICROSOFT_CLIENT_ID');
  }

  get microsoftClientSecret(): string {
    return this.configService.get<string>('MICROSOFT_CLIENT_SECRET');
  }

  get microsoftCallbackUrl(): string {
    return this.configService.get<string>('MICROSOFT_CALLBACK_URL');
  }

  get githubClientId(): string {
    return this.configService.get<string>('GITHUB_CLIENT_ID');
  }

  get githubClientSecret(): string {
    return this.configService.get<string>('GITHUB_CLIENT_SECRET');
  }

  get githubCallbackUrl(): string {
    return this.configService.get<string>('GITHUB_CALLBACK_URL');
  }

  get apiKey(): string {
    return this.configService.get<string>('API_KEY');
  }
}
