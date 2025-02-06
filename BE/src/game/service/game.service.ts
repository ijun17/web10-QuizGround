import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { REDIS_KEY } from '../../common/constants/redis-key.constant';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { GameValidator } from '../validations/game.validator';
import SocketEvents from '../../common/constants/socket-events';
import { StartGameDto } from '../dto/start-game.dto';
import { Namespace, Socket } from 'socket.io';
import { mockQuizData } from '../../../test/mocks/quiz-data.mock';
import { QuizCacheService } from './quiz.cache.service';
import { RedisSubscriberService } from '../redis/redis-subscriber.service';
import { parseHeaderToObject } from '../../common/utils/utils';
import { GameRoomService } from './game.room.service';
import { SetPlayerNameDto } from '../dto/set-player-name.dto';
import { Trace, TraceClass } from '../../common/interceptor/SocketEventLoggerInterceptor';

@TraceClass()
@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly gameValidator: GameValidator,
    private readonly quizCacheService: QuizCacheService,
    private readonly redisSubscriberService: RedisSubscriberService,
    private readonly gameRoomService: GameRoomService
  ) {}

  /**
   * 최적화된 플레이어 위치 업데이트 함수
   * @param updatePosition - 업데이트할 위치 정보
   * @param clientId - 플레이어 ID
   * @returns Promise<void>
   * @throws {Error} 플레이어가 게임에 속해있지 않은 경우
   * @example
   * await updatePosition({ gameId: '123', newPosition: [1, 2] }, 'player1');
   */
  async updatePosition(updatePosition: UpdatePositionDto, clientId: string): Promise<void> {
    const { gameId, newPosition } = updatePosition;
    const playerKey = REDIS_KEY.PLAYER(clientId);

    // 1. 먼저 검증
    const playerGameId = await this.redis.hget(playerKey, 'gameId');
    this.gameValidator.validatePlayerInRoomV2(
      SocketEvents.UPDATE_POSITION,
      gameId,
      playerGameId?.toString()
    );

    // 2. 검증 통과 후 업데이트 수행
    const pipeline = this.redis.pipeline();
    pipeline.set(`${playerKey}:Changes`, 'Position');
    pipeline.hmset(playerKey, {
      positionX: newPosition[0].toString(),
      positionY: newPosition[1].toString()
    });

    await pipeline.exec();
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
      await this.redis.hset(REDIS_KEY.ROOM_QUIZ(gameId, quiz.id), {
        quiz: quiz.quiz,
        answer: quiz.choiceList.find((choice) => choice.isAnswer).order,
        limitTime: quiz.limitTime.toString(),
        choiceCount: quiz.choiceList.length.toString()
      });
      await this.redis.hset(
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
    await this.redis.hset(roomKey, {
      status: 'playing'
    });

    // 첫 퀴즈 걸어주기
    await this.redis.set(REDIS_KEY.ROOM_CURRENT_QUIZ(gameId), '-1:end'); // 0:start, 0:end, 1:start, 1:end
    await this.redis.set(REDIS_KEY.ROOM_TIMER(gameId), 'timer', 'EX', 3);

    this.logger.verbose(`게임 시작 (gameId: ${gameId}) (gameMode: ${room.gameMode})`);
  }

  async setPlayerName(setPlayerNameDto: SetPlayerNameDto, clientId: string) {
    const { playerName } = setPlayerNameDto;

    await this.redis.set(`${REDIS_KEY.PLAYER(clientId)}:Changes`, 'Name');
    await this.redis.hmset(REDIS_KEY.PLAYER(clientId), {
      playerName: playerName
    });
  }

  async subscribeRedisEvent(server: Namespace) {
    await this.redisSubscriberService.initializeSubscribers(server);
  }

  async connection(client: Socket) {
    client.data.playerId = client.handshake.headers['player-id'];

    let gameId = client.handshake.query['game-id'] as string;
    const createRoomData = parseHeaderToObject(client.handshake.query['create-room'] as string);
    if (createRoomData) {
      gameId = await this.gameRoomService.createRoom(
        {
          title: createRoomData.title as string,
          gameMode: createRoomData.gameMode as string,
          maxPlayerCount: createRoomData.maxPlayerCount as number,
          isPublic: createRoomData.isPublic as boolean
        },
        client.data.playerId
      );
      client.emit(SocketEvents.CREATE_ROOM, { gameId });
    }

    await this.gameRoomService.joinRoom(client, gameId, client.data.playerId);
  }
}
