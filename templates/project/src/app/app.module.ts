import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthModule } from './health/health.module';
import { ConfigModule as AppConfigModule } from '../config/config.module';
import { CoreModule } from '../core/core.module';
import { UsersModule } from '../modules/users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    AppConfigModule,
    CoreModule,
    HealthModule,
    UsersModule,
    {{#each optionalServices}}
    {{#if enabled}}
    // {{name}} module will be imported here
    {{/if}}
    {{/each}}
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
