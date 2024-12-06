import { config } from 'dotenv';
import { join } from 'path';
import 'pinpoint-node-agent';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import { GameActivityInterceptor } from './game/interceptor/gameActivity.interceptor';
// env 불러오기
config({ path: join(__dirname, '..', '.env') }); // ../ 경로의 .env 로드

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors();

  // 전역 인터셉터로 등록
  app.useGlobalInterceptors(app.get(GameActivityInterceptor));

  const port = process.env.WAS_PORT || 3000;
  await app.listen(port);
  Logger.log(`Application running on port ${port}`);
}

bootstrap();
