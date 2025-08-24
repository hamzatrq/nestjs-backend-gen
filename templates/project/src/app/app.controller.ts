import { Controller, Get, Redirect } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AppService } from './app.service';

@ApiTags('App')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  @ApiOperation({ summary: 'Get application info' })
  @ApiResponse({ status: 200, description: 'Application information' })
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('ping')
  @ApiOperation({ summary: 'Ping endpoint' })
  @ApiResponse({ status: 200, description: 'Pong response' })
  ping(): { message: string; timestamp: string } {
    return this.appService.ping();
  }

  @Get('health')
  @Redirect('/health', 301)
  @ApiOperation({ summary: 'Redirect to health check' })
  healthRedirect(): void {
    // Redirects to /health endpoint
  }
}
