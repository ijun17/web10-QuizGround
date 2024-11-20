import { Injectable } from '@nestjs/common';
import { RedisSubscriber } from './base.subscriber';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Server } from 'socket.io';
import { REDIS_KEY } from '../../constants/redis-key.constant';
import SocketEvents from '../../constants/socket-events';

@Injectable()
export class ScoringSubscriber extends RedisSubscriber {
  private scoringMap = new Map<string, number>();

  constructor(@InjectRedis() redis: Redis) {
    super(redis);
  }

  async subscribe(server: Server): Promise<void> {
    const subscriber = this.redis.duplicate();
    await subscriber.psubscribe('scoring:*');

    subscriber.on('pmessage', async (_pattern, channel, message) => {
      const gameId = channel.split(':')[1];
      await this.handleScoring(gameId, parseInt(message), server);
    });
  }

  private async handleScoring(gameId: string, completeClientsCount: number, server: Server) {
    if (!this.scoringMap.has(gameId)) {
      this.scoringMap[gameId] = 0;
    }
    this.scoringMap[gameId] += completeClientsCount;

    const playersCount = await this.redis.scard(REDIS_KEY.ROOM_PLAYERS(gameId));
    if (this.scoringMap[gameId] >= playersCount) {
      await this.completeScoring(gameId, server);
    }
  }

  private async completeScoring(gameId: string, server: Server) {
    const { quiz, players } = await this.getQuizResults(gameId);

    server.to(gameId).emit(SocketEvents.END_QUIZ_TIME, {
      answer: quiz.answer,
      players
    });

    await this.updateQuizState(gameId, quiz.quizNum);
    this.logger.verbose(`endQuizTime: ${gameId} - ${quiz.quizNum}`);
  }

  private async updateQuizState(gameId: string, quizNum: number) {
    await this.redis.set(REDIS_KEY.ROOM_CURRENT_QUIZ(gameId), `${quizNum}:end`);
    await this.redis.set(REDIS_KEY.ROOM_TIMER(gameId), 'timer', 'EX', '10', 'NX');
  }
}
