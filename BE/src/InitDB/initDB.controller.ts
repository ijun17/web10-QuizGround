import { Controller, Post } from '@nestjs/common';
import { InitDbService } from './InitDb.Service';

@Controller('/api/initDB')
export class InitDbController {
  constructor(private readonly initDBService: InitDbService) {}

  @Post()
  create() {
    return this.initDBService.create();
  }
}
