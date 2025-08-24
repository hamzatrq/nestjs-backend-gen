import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { AbacModule } from './abac/abac.module';
import { SecurityModule } from './security/security.module';
import { LoggerModule } from './logger/logger.module';

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    AbacModule,
    SecurityModule,
    LoggerModule,
  ],
  exports: [
    PrismaModule,
    AuthModule,
    AbacModule,
    SecurityModule,
    LoggerModule,
  ],
})
export class CoreModule {}
