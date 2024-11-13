import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { REDIS_KEY } from '../../common/constants/redis-key.constant';
import { UpdatePositionDto } from '../dto/update-position.dto';
import { GameValidator } from '../validations/game.validator';
import SocketEvents from '../../common/constants/socket-events';
import { StartGameDto } from '../dto/start-game.dto';
import { Server } from 'socket.io';
import { HttpService } from '@nestjs/axios';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly httpService: HttpService,
    private readonly gameValidator: GameValidator
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

    const getQuizsetURL = `http://localhost:3000/api/quizset/${room.quizSetId}`;
    const quizset = await this.httpService.axiosRef({
      url: getQuizsetURL,
      method: 'GET'
    });
    this.gameValidator.validateQuizsetCount(
      SocketEvents.START_GAME,
      parseInt(room.quizSetCount),
      quizset.data.quizList.length
    );

    const shuffledQuizList = quizset.data.quizList.sort(() => 0.5 - Math.random());
    const selectedQuizList = shuffledQuizList.slice(0, room.quizSetCount);
    await this.redis.sadd(
      REDIS_KEY.ROOM_QUIZ_SET(gameId),
      ...selectedQuizList.map((quiz) => quiz.id)
    );
    for (const quiz of selectedQuizList) {
      await this.redis.hmset(REDIS_KEY.ROOM_QUIZ(gameId, quiz.id), {
        quiz: quiz.quiz,
        // answer: quiz.answer, TODO: API에서도 정답을 보내줘야 하나?
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

    await this.redis.set(`${roomKey}:Changes`, 'Start');
    await this.redis.hmset(roomKey, {
      status: 'playing'
    });
    await this.redis.set(REDIS_KEY.ROOM_CURRENT_QUIZ(gameId), 'start', 'EX', 5);
    this.logger.verbose(`게임 시작: ${gameId}`);
  }

  async subscribeRedisEvent(server: Server) {
    this.redis.config('SET', 'notify-keyspace-events', 'KEx');

    const roomSubscriber = this.redis.duplicate();
    await roomSubscriber.psubscribe('__keyspace@0__:Room:*');
    roomSubscriber.on('pmessage', async (channel, message) => {
      const key = channel.replace('__keyspace@0__:', '');
      const splitKey = key.split(':');
      if (splitKey.length !== 2) {
        return;
      }
      const gameId = splitKey[1];

      if (message === 'hset') {
        const changes = await this.redis.get(`${key}:Changes`);
        const roomData = await this.redis.hgetall(key);

        if (changes === 'Option') {
          server.to(gameId).emit(SocketEvents.UPDATE_ROOM_OPTION, {
            title: roomData.title,
            gameMode: roomData.gameMode,
            maxPlayerCount: roomData.maxPlayerCount,
            isPublic: roomData.isPublic
          });
        } else if (changes === 'Quizset') {
          server.to(gameId).emit(SocketEvents.UPDATE_ROOM_QUIZSET, {
            quizSetId: roomData.quizSetId,
            quizCount: roomData.quizCount
          });
        } else if (changes === 'Start') {
          server.to(gameId).emit(SocketEvents.START_GAME, '');
        }
      }
    });

    const playerSubscriber = this.redis.duplicate();
    playerSubscriber.psubscribe('__keyspace@0__:Player:*');
    playerSubscriber.on('pmessage', async (channel, message) => {
      const key = channel.replace('__keyspace@0__:', '');
      const splitKey = key.split(':');
      if (splitKey.length !== 2) {
        return;
      }
      const playerId = splitKey[1];

      if (message === 'hset') {
        const changes = await this.redis.get(`${key}:Changes`);
        const playerData = await this.redis.hgetall(key);
        if (changes === 'Join') {
          const newPlayer = {
            playerId: playerId,
            playerName: playerData.playerName,
            playerPosition: [parseFloat(playerData.positionX), parseFloat(playerData.positionY)]
          };
          server.to(playerData.gameId).emit(SocketEvents.JOIN_ROOM, {
            players: [newPlayer]
          });
        } else if (changes === 'Position') {
          server.to(playerData.gameId).emit(SocketEvents.UPDATE_POSITION, {
            playerId: playerId,
            playerPosition: [parseFloat(playerData.positionX), parseFloat(playerData.positionY)]
          });
        } else if (changes === 'Disconnect') {
          server.to(playerData.gameId).emit(SocketEvents.EXIT_ROOM, {
            playerId: playerId
          });
        }
      }
    });
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
    await this.redis.set(`${playerKey}:Changes`, 'Disconnect');
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
