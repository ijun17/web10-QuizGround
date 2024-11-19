import { Module } from '@nestjs/common';
import { GameGateway } from './game.gateway';
import { GameService } from './service/game.service';
import { RedisModule } from '@nestjs-modules/ioredis';
import { GameValidator } from './validations/game.validator';
import { GameChatService } from './service/game.chat.service';
import { GameRoomService } from './service/game.room.service';
import { QuizCacheService } from './service/quiz.cache.service';
import { QuizSetModule } from '../quiz-set/quiz-set.module';
import { QuizSetService } from '../quiz-set/service/quiz-set.service';

@Module({
  imports: [RedisModule, QuizSetModule],
  providers: [
    GameGateway,
    GameService,
    GameChatService,
    GameRoomService,
    GameValidator,
    QuizSetService,
    QuizCacheService
  ],
  exports: [GameService]
})
export class GameModule {}
