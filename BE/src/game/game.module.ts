import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './service/game.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { GameValidator } from './validations/game.validator';
import { HttpModule } from '@nestjs/axios';
import { GameChatService } from './service/game.chat.service';
import { GameRoomService } from './service/game.room.service';

@Module({
  imports: [RedisModule, HttpModule],
  providers: [GameGateway, GameService, GameChatService, GameRoomService, GameValidator]
})
export class GameModule {}
