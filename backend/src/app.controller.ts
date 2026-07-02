import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('search')
  async search(@Query('q') q: string) {
    if (!q) return [];
    return this.appService.search(q);
  }
}
