import { InitDBService } from './InitDB.Service';
import { Controller, Post } from '@nestjs/common';

@Controller('/api/initDB')
export class InitDBController {
  constructor(private readonly initDBService: InitDBService) {}

  @Post()
  create() {
    // throw new HttpException('test용 api 입니다.', 501);
    return this.initDBService.create();
  }
}
