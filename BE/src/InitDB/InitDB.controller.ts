import { Controller, Post } from '@nestjs/common';
import { InitDBService } from './InitDB.Service';

@Controller('/api/initDB')
export class InitDBController {
  constructor(private readonly initDBService: InitDBService) {}

  @Post()
  create() {
    return this.initDBService.create();
  }
}
