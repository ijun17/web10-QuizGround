import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { REDIS_KEY } from '../../common/constants/redis-key.constant';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { GameValidator } from '../validations/game.validator';
import SocketEvents from '../../common/constants/socket-events';
import { StartGameDto } from '../dto/start-game.dto';
import { Server } from 'socket.io';
import { mockQuizData } from '../../../test/mocks/quiz-data.mock';
import { QuizCacheService } from './quiz.cache.service';
import { RedisSubscriberService } from '../redis/redis-subscriber.service';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly gameValidator: GameValidator,
    private readonly quizCacheService: QuizCacheService,
    private readonly redisSubscriberService: RedisSubscriberService
  ) {}

  async updatePosition(updatePosition: UpdatePositionDto, clientId: string) {
    const { gameId, newPosition } = updatePosition;

    const playerKey = REDIS_KEY.PLAYER(clientId);

    const player = await this.redis.hgetall(playerKey);
    this.gameValidator.validatePlayerInRoom(SocketEvents.UPDATE_POSITION, gameId, player);

    await this.redis.set(`${playerKey}:Changes`, 'Position');
    await this.redis.hmset(playerKey, {
      positionX: newPosition[0].toString(),
      positionY: newPosition[1].toString()
    });

    this.logger.verbose(
      `플레이어 위치 업데이트: ${gameId} - ${clientId} (${player.playerName}) = ${newPosition}`
    );
  }

  async startGame(startGameDto: StartGameDto, clientId: string) {
    const { gameId } = startGameDto;
    const roomKey = `Room:${gameId}`;

    const room = await this.redis.hgetall(roomKey);
    this.gameValidator.validateRoomExists(SocketEvents.START_GAME, room);

    this.gameValidator.validatePlayerIsHost(SocketEvents.START_GAME, room, clientId);

    /**
     * 퀴즈셋이 설정되어 있지 않으면 기본 퀴즈셋을 사용
     */
    const quizset =
      room.quizSetId === '-1'
        ? mockQuizData
        : await this.quizCacheService.getQuizSet(+room.quizSetId);

    //roomKey에 해당하는 room에 quizSetTitle을 quizset.title로 설정
    await this.redis.hset(roomKey, {
      quizSetTitle: quizset.title
    });

    this.gameValidator.validateQuizsetCount(
      SocketEvents.START_GAME,
      parseInt(room.quizCount),
      quizset.quizList.length
    );

    // Room Quiz 초기화
    const prevQuizList = await this.redis.smembers(REDIS_KEY.ROOM_QUIZ_SET(gameId));
    for (const prevQuiz of prevQuizList) {
      await this.redis.del(REDIS_KEY.ROOM_QUIZ(gameId, prevQuiz));
      await this.redis.del(REDIS_KEY.ROOM_QUIZ_CHOICES(gameId, prevQuiz));
    }
    await this.redis.del(REDIS_KEY.ROOM_QUIZ_SET(gameId));

    // 퀴즈셋 랜덤 선택
    const shuffledQuizList = quizset.quizList.sort(() => 0.5 - Math.random());
    const selectedQuizList = shuffledQuizList.slice(0, parseInt(room.quizCount));

    // 퀴즈들 id 레디스에 등록
    await this.redis.sadd(
      REDIS_KEY.ROOM_QUIZ_SET(gameId),
      ...selectedQuizList.map((quiz) => quiz.id)
    );
    for (const quiz of selectedQuizList) {
      await this.redis.hmset(REDIS_KEY.ROOM_QUIZ(gameId, quiz.id), {
        quiz: quiz.quiz,
        answer: quiz.choiceList.find((choice) => choice.isAnswer).order,
        limitTime: quiz.limitTime.toString(),
        choiceCount: quiz.choiceList.length.toString()
      });
      await this.redis.hmset(
        REDIS_KEY.ROOM_QUIZ_CHOICES(gameId, quiz.id),
        quiz.choiceList.reduce(
          (acc, choice) => {
            acc[choice.order] = choice.content;
            return acc;
          },
          {} as Record<number, string>
        )
      );
    }

    // 리더보드 초기화
    const leaderboard = await this.redis.zrange(REDIS_KEY.ROOM_LEADERBOARD(gameId), 0, -1);
    for (const playerId of leaderboard) {
      await this.redis.zadd(REDIS_KEY.ROOM_LEADERBOARD(gameId), 0, playerId);
    }

    // 게임이 시작되었음을 알림
    await this.redis.set(`${roomKey}:Changes`, 'Start');
    await this.redis.hmset(roomKey, {
      status: 'playing'
    });

    // 첫 퀴즈 걸어주기
    await this.redis.set(REDIS_KEY.ROOM_CURRENT_QUIZ(gameId), '-1:end'); // 0:start, 0:end, 1:start, 1:end
    await this.redis.set(REDIS_KEY.ROOM_TIMER(gameId), 'timer', 'EX', 3);

    this.logger.verbose(`게임 시작: ${gameId}`);
  }

  async subscribeRedisEvent(server: Server) {
    await this.redisSubscriberService.initializeSubscribers(server);
  }

  async disconnect(clientId: string) {
    const playerKey = REDIS_KEY.PLAYER(clientId);
    const playerData = await this.redis.hgetall(playerKey);

    const roomPlayersKey = REDIS_KEY.ROOM_PLAYERS(playerData.gameId);
    await this.redis.srem(roomPlayersKey, clientId);

    const roomLeaderboardKey = REDIS_KEY.ROOM_LEADERBOARD(playerData.gameId);
    await this.redis.zrem(roomLeaderboardKey, clientId);

    const roomKey = REDIS_KEY.ROOM(playerData.gameId);
    const host = await this.redis.hget(roomKey, 'host');
    const players = await this.redis.smembers(roomPlayersKey);
    if (host === clientId && players.length > 0) {
      const newHost = await this.redis.srandmember(REDIS_KEY.ROOM_PLAYERS(playerData.gameId));
      await this.redis.hmset(roomKey, {
        host: newHost
      });
    }
    await this.redis.set(`${playerKey}:Changes`, 'Disconnect', 'EX', 600); // 해당플레이어의 변화정보 10분 후에 삭제
    await this.redis.hmset(playerKey, {
      disconnected: '1'
    });

    if (players.length === 0) {
      await this.redis.del(roomKey);
      await this.redis.del(roomPlayersKey);
      await this.redis.del(roomLeaderboardKey);
    }
  }
}
