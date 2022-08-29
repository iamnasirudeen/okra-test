import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('/scrape')
  async getHello() {
    return await this.appService.runActions();
  }
}
