import { Injectable } from '@nestjs/common';
import { RedisSubscriber } from './base.subscriber';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Server } from 'socket.io';
import { REDIS_KEY } from '../../../common/constants/redis-key.constant';
import SocketEvents from '../../../common/constants/socket-events';

@Injectable()
export class TimerSubscriber extends RedisSubscriber {
  constructor(
    @InjectRedis() redis: Redis // 부모에게 전달
  ) {
    super(redis);
  }

  async subscribe(server: Server): Promise<void> {
    const subscriber = this.redis.duplicate();
    await subscriber.psubscribe(`__keyspace@0__:${REDIS_KEY.ROOM_TIMER('*')}`);

    subscriber.on('pmessage', async (_pattern, channel, message) => {
      const gameId = this.extractGameId(channel);
      if (!gameId || message !== 'expired') {
        return;
      }

      const currentQuiz = await this.redis.get(REDIS_KEY.ROOM_CURRENT_QUIZ(gameId));
      const [quizNum, state] = currentQuiz.split(':');

      if (state === 'start') {
        await this.handleQuizScoring(gameId, parseInt(quizNum), server);
      } else {
        await this.handleNextQuiz(gameId, parseInt(quizNum), server);
      }
    });
  }

  private extractGameId(channel: string): string | null {
    const splitKey = channel.replace('__keyspace@0__:', '').split(':');
    return splitKey.length === 3 ? splitKey[1] : null;
  }

  private async handleQuizScoring(gameId: string, quizNum: number, server: Server) {
    const quizList = await this.redis.smembers(REDIS_KEY.ROOM_QUIZ_SET(gameId));
    const quiz = await this.redis.hgetall(REDIS_KEY.ROOM_QUIZ(gameId, quizList[quizNum]));

    const sockets = await server.in(gameId).fetchSockets();
    const clients = sockets.map((socket) => socket.id);
    const correctPlayers = [];

    // 플레이어 답안 처리
    for (const clientId of clients) {
      const player = await this.redis.hgetall(REDIS_KEY.PLAYER(clientId));
      const selectAnswer = this.calculateAnswer(player.positionX, player.positionY);

      await this.redis.set(`${REDIS_KEY.PLAYER(clientId)}:Changes`, 'AnswerCorrect');
      if (selectAnswer.toString() === quiz.answer) {
        correctPlayers.push(clientId);
        await this.redis.hmset(REDIS_KEY.PLAYER(clientId), { isAnswerCorrect: '1' });
      } else {
        await this.redis.hmset(REDIS_KEY.PLAYER(clientId), { isAnswerCorrect: '0' });
      }
    }

    // 점수 업데이트
    for (const clientId of correctPlayers) {
      await this.redis.zincrby(
        REDIS_KEY.ROOM_LEADERBOARD(gameId),
        1000 / correctPlayers.length,
        clientId
      );
    }

    await this.redis.publish(`scoring:${gameId}`, clients.length.toString());
    this.logger.verbose(`채점: ${gameId} - ${clients.length}`);
  }

  private async handleNextQuiz(gameId: string, currentQuizNum: number, server: Server) {
    const newQuizNum = currentQuizNum + 1;
    const quizList = await this.redis.smembers(REDIS_KEY.ROOM_QUIZ_SET(gameId));

    if (quizList.length <= newQuizNum) {
      const leaderboard = await this.redis.zrange(
        REDIS_KEY.ROOM_LEADERBOARD(gameId),
        0,
        -1,
        'WITHSCORES'
      );

      server.to(gameId).emit(SocketEvents.END_GAME, {
        host: leaderboard[0]
      });
      this.logger.verbose(`endGame: ${leaderboard[0]}`);
      return;
    }

    const quiz = await this.redis.hgetall(REDIS_KEY.ROOM_QUIZ(gameId, quizList[newQuizNum]));
    const quizChoices = await this.redis.hgetall(
      REDIS_KEY.ROOM_QUIZ_CHOICES(gameId, quizList[newQuizNum])
    );

    server.to(gameId).emit(SocketEvents.START_QUIZ_TIME, {
      quiz: quiz.quiz,
      choiceList: Object.entries(quizChoices).map(([key, value]) => ({
        order: key,
        content: value
      })),
      startTime: Date.now() + 3000,
      endTime: Date.now() + (parseInt(quiz.limitTime) + 3) * 1000
    });

    await this.redis.set(REDIS_KEY.ROOM_CURRENT_QUIZ(gameId), `${newQuizNum}:start`);
    await this.redis.set(
      REDIS_KEY.ROOM_TIMER(gameId),
      'timer',
      'EX',
      (parseInt(quiz.limitTime) + 3).toString(),
      'NX'
    );
    this.logger.verbose(`startQuizTime: ${gameId} - ${newQuizNum}`);
  }

  private calculateAnswer(positionX: string, positionY: string): number {
    if (parseFloat(positionY) < 0.5) {
      return parseFloat(positionX) < 0.5 ? 1 : 2;
    }
    return parseFloat(positionX) < 0.5 ? 3 : 4;
  }
}
