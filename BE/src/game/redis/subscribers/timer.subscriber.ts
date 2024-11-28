import { Injectable } from '@nestjs/common';
import { RedisSubscriber } from './base.subscriber';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Namespace } from 'socket.io';
import { REDIS_KEY } from '../../../common/constants/redis-key.constant';
import SocketEvents from '../../../common/constants/socket-events';
import { GameMode } from '../../../common/constants/game-mode';

@Injectable()
export class TimerSubscriber extends RedisSubscriber {
  constructor(
    @InjectRedis() redis: Redis // 부모에게 전달
  ) {
    super(redis);
  }

  async subscribe(server: Namespace): Promise<void> {
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

  private async handleQuizScoring(gameId: string, quizNum: number, server: Namespace) {
    const quizList = await this.redis.smembers(REDIS_KEY.ROOM_QUIZ_SET(gameId));
    const quiz = await this.redis.hgetall(REDIS_KEY.ROOM_QUIZ(gameId, quizList[quizNum]));

    if ((await this.redis.set(REDIS_KEY.ROOM_SCORING_STATUS(gameId), 'START', 'NX')) !== 'OK') {
      return;
    }

    const clients = await this.redis.smembers(REDIS_KEY.ROOM_PLAYERS(gameId));

    const correctPlayers = [];
    const inCorrectPlayers = [];

    // 플레이어 답안 처리
    for (const clientId of clients) {
      const player = await this.redis.hgetall(REDIS_KEY.PLAYER(clientId));

      if (player.isAlive === '0') {
        continue;
      }

      const selectAnswer = this.calculateAnswer(player.positionX, player.positionY);

      await this.redis.set(`${REDIS_KEY.PLAYER(clientId)}:Changes`, 'AnswerCorrect');
      if (selectAnswer.toString() === quiz.answer) {
        correctPlayers.push(clientId);
        await this.redis.hset(REDIS_KEY.PLAYER(clientId), { isAnswerCorrect: '1' });
      } else {
        inCorrectPlayers.push(clientId);
        await this.redis.hset(REDIS_KEY.PLAYER(clientId), { isAnswerCorrect: '0' });
      }
    }

    // 점수 업데이트
    const gameMode = await this.redis.hget(REDIS_KEY.ROOM(gameId), 'gameMode');
    const leaderboardKey = REDIS_KEY.ROOM_LEADERBOARD(gameId);

    if (gameMode === GameMode.RANKING) {
      const score = 1000 / correctPlayers.length;
      correctPlayers.forEach((clientId) => {
        this.redis.zincrby(leaderboardKey, score, clientId);
      });
    } else if (gameMode === GameMode.SURVIVAL) {
      correctPlayers.forEach((clientId) => {
        this.redis.zadd(leaderboardKey, 1, clientId);
      });
      inCorrectPlayers.forEach((clientId) => {
        this.redis.zadd(leaderboardKey, 0, clientId);
        this.redis.hset(REDIS_KEY.PLAYER(clientId), { isAlive: '0' });
      });
    }

    await this.redis.publish(`scoring:${gameId}`, clients.length.toString());

    await this.redis.del(REDIS_KEY.ROOM_SCORING_STATUS(gameId));

    this.logger.verbose(
      `[Quiz] Room: ${gameId} | gameMode: ${gameMode === GameMode.SURVIVAL ? '서바이벌' : '랭킹'} | totalPlayers: ${clients.length} | ${gameMode === GameMode.SURVIVAL ? `생존자: ${correctPlayers.length}명` : `정답자: ${correctPlayers.length}명`}`
    );
  }

  private async handleNextQuiz(gameId: string, currentQuizNum: number, server: Namespace) {
    const newQuizNum = currentQuizNum + 1;
    const quizList = await this.redis.smembers(REDIS_KEY.ROOM_QUIZ_SET(gameId));

    // 생존 모드에서 모두 탈락하진 않았는지 체크
    const players = await this.redis.smembers(REDIS_KEY.ROOM_PLAYERS(gameId));
    const alivePlayers = players.filter(async (id) => {
      const isAlive = await this.redis.hget(REDIS_KEY.PLAYER(id), 'isAlive');
      return isAlive === '1';
    });

    if (quizList.length <= newQuizNum || alivePlayers.length === 0) {
      const leaderboard = await this.redis.zrange(
        REDIS_KEY.ROOM_LEADERBOARD(gameId),
        0,
        -1,
        'WITHSCORES'
      );

      this.redis.set(`${REDIS_KEY.ROOM(gameId)}:Changes`, 'End');
      this.redis.hset(REDIS_KEY.ROOM(gameId), {
        host: leaderboard[0],
        status: 'waiting',
        isWaiting: '1'
      });

      server.to(gameId).emit(SocketEvents.END_GAME, {
        host: leaderboard[0]
      });
      this.logger.verbose(`[endGame]: ${gameId}`);
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
