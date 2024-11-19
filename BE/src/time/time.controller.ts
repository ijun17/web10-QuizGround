import { Controller, Get } from '@nestjs/common';

@Controller('/api/time')
export class TimeController {
  constructor() {}

  @Get()
  async getTime() {
    return {
      serverTime: Date.now()
    };
  }
}
