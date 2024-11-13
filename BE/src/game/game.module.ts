import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { GameValidator } from './validations/game.validator';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [RedisModule, HttpModule],
  providers: [GameGateway, GameService, GameValidator]
})
export class GameModule {}
