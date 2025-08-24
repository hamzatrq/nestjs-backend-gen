import { AuthProvider } from '../types';
import { kebabCase, pascalCase } from 'change-case';
import path from 'path';
import fs from 'fs-extra';

export class AuthConfigurator {
  static async configureProviders(providers: AuthProvider[]): Promise<void> {
    for (const provider of providers) {
      await this.configureProvider(provider);
    }
  }

  private static async configureProvider(provider: AuthProvider): Promise<void> {
    // Create auth module directory
    const authPath = path.join(process.cwd(), 'src', 'core', 'auth');
    await fs.ensureDir(authPath);

    // Generate strategy
    await this.generateStrategy(provider, authPath);

    // Generate guard
    await this.generateGuard(provider, authPath);

    // Update auth module
    await this.updateAuthModule(provider, authPath);
  }

  private static async generateStrategy(provider: AuthProvider, authPath: string): Promise<void> {
    const providerName = provider.name;
    const providerNameKebab = kebabCase(providerName);


    let content = '';
    
    switch (providerName) {
      case 'jwt':
        content = this.generateJwtStrategy();
        break;
      case 'google':
        content = this.generateGoogleStrategy();
        break;
      case 'microsoft':
        content = this.generateMicrosoftStrategy();
        break;
      case 'github':
        content = this.generateGithubStrategy();
        break;
      case 'api-key':
        content = this.generateApiKeyStrategy();
        break;
      default:
        content = this.generateGenericStrategy(provider);
    }

    await fs.writeFile(path.join(authPath, `${providerNameKebab}.strategy.ts`), content);
  }

  private static generateJwtStrategy(): string {
    return `import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email, role: payload.role };
  }
}
`;
  }

  private static generateGoogleStrategy(): string {
    return `import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, VerifyCallback } from 'passport-google-oauth20';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GOOGLE_CLIENT_ID'),
      clientSecret: configService.get('GOOGLE_CLIENT_SECRET'),
      callbackURL: configService.get('GOOGLE_CALLBACK_URL'),
      scope: ['email', 'profile'],
    });
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: any,
    done: VerifyCallback,
  ): Promise<any> {
    const { name, emails } = profile;
    const user = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      accessToken,
    };
    done(null, user);
  }
}
`;
  }

  private static generateMicrosoftStrategy(): string {
    return `import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-microsoft';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MicrosoftStrategy extends PassportStrategy(Strategy, 'microsoft') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('MICROSOFT_CLIENT_ID'),
      clientSecret: configService.get('MICROSOFT_CLIENT_SECRET'),
      callbackURL: configService.get('MICROSOFT_CALLBACK_URL'),
      scope: ['user.read'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const user = {
      email: profile.emails[0].value,
      firstName: profile.name.givenName,
      lastName: profile.name.familyName,
      accessToken,
    };
    done(null, user);
  }
}
`;
  }

  private static generateGithubStrategy(): string {
    return `import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(private configService: ConfigService) {
    super({
      clientID: configService.get('GITHUB_CLIENT_ID'),
      clientSecret: configService.get('GITHUB_CLIENT_SECRET'),
      callbackURL: configService.get('GITHUB_CALLBACK_URL'),
      scope: ['user:email'],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    const user = {
      email: profile.emails[0].value,
      username: profile.username,
      accessToken,
    };
    done(null, user);
  }
}
`;
  }

  private static generateApiKeyStrategy(): string {
    return `import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-http-bearer';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ApiKeyStrategy extends PassportStrategy(Strategy, 'api-key') {
  constructor(private configService: ConfigService) {
    super();
  }

  async validate(apiKey: string): Promise<any> {
    const validApiKey = this.configService.get('API_KEY');
    
    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API key');
    }
    
    return { type: 'api-key' };
  }
}
`;
  }

  private static generateGenericStrategy(provider: AuthProvider): string {
    const providerName = provider.name;
    const providerNameKebab = kebabCase(providerName);
    const providerNamePascal = pascalCase(providerName);

    return `import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-${providerNameKebab}';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class ${providerNamePascal}Strategy extends PassportStrategy(Strategy, '${providerNameKebab}') {
  constructor(private configService: ConfigService) {
    super({
      // Configure ${providerName} strategy options
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: any, done: any) {
    // Implement ${providerName} validation logic
    const user = {
      email: profile.emails?.[0]?.value,
      accessToken,
    };
    done(null, user);
  }
}
`;
  }

  private static async generateGuard(provider: AuthProvider, authPath: string): Promise<void> {
    const providerName = provider.name;
    const providerNameKebab = kebabCase(providerName);
    const providerNamePascal = pascalCase(providerName);

    const content = `import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ${providerNamePascal}AuthGuard extends AuthGuard('${providerNameKebab}') {}
`;

    await fs.writeFile(path.join(authPath, 'guards', `${providerNameKebab}-auth.guard.ts`), content);
  }

  private static async updateAuthModule(provider: AuthProvider, authPath: string): Promise<void> {
    const modulePath = path.join(authPath, 'auth.module.ts');
    
    let content = '';
    if (await fs.pathExists(modulePath)) {
      content = await fs.readFile(modulePath, 'utf-8');
    } else {
      content = this.generateBaseAuthModule();
    }

    // Add provider to module
    const providerName = provider.name;
    const providerNameKebab = kebabCase(providerName);
    const providerNamePascal = pascalCase(providerName);

    // This is a simplified approach - in a real implementation, you'd parse and modify the AST
    content = content.replace(
      '// Add strategies here',
      `// Add strategies here
      ${providerNamePascal}Strategy,`
    );

    content = content.replace(
      '// Import strategies here',
      `// Import strategies here
import { ${providerNamePascal}Strategy } from './${providerNameKebab}.strategy';`
    );

    await fs.writeFile(modulePath, content);
  }

  private static generateBaseAuthModule(): string {
    return `import { Module } from '@nestjs/common';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
// Import strategies here

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [
    // Add strategies here
  ],
  exports: [JwtModule],
})
export class AuthModule {}
`;
  }
}
