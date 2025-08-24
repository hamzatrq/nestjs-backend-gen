import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class HealthService {
  constructor(private readonly configService: ConfigService) {}

  checkReadiness(): { status: string; timestamp: string; version: string } {
    return {
      status: 'ready',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
  }
}
