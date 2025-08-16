import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('health')
  getHealth(): { status: string; timestamp: string } {
    return {
      status: 'OK',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('api')
  getApiInfo(): { message: string; version: string; endpoints: string[] } {
    return {
      message: 'User Contact Management API',
      version: '1.0.0',
      endpoints: ['/health', '/api'],
    };
  }
}
