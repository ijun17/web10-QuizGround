import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';
import * as config from 'config';
import { RedisClient } from './repository/RedisClient';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  await app.listen(config.get('server.port'));
  Logger.log('Application running on port 3000');

  const redisClient = RedisClient;
  await redisClient.set('key', 1);
  console.log(await redisClient.get('key'));
}

bootstrap();
