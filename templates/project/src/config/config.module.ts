import { Module } from '@nestjs/common';
import { AppConfigModule } from './app.config';
import { DatabaseConfigModule } from './database.config';
import { AuthConfigModule } from './auth.config';
import { SecurityConfigModule } from './security.config';
import { LoggingConfigModule } from './logging.config';
{{#if enableSentry}}
import { SentryConfigModule } from './sentry.config';
{{/if}}

@Module({
  imports: [
    AppConfigModule,
    DatabaseConfigModule,
    AuthConfigModule,
    SecurityConfigModule,
    LoggingConfigModule,
    {{#if enableSentry}}
    SentryConfigModule,
    {{/if}}
  ],
})
export class ConfigModule {}
