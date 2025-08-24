import { Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { PrismaExceptionFilter } from './prisma-exception.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  providers: [
    PrismaService,
    {
      provide: APP_FILTER,
      useClass: PrismaExceptionFilter,
    },
  ],
  exports: [PrismaService],
})
export class PrismaModule {}
