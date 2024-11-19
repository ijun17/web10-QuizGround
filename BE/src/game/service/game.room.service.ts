import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { GameValidator } from '../validations/game.validator';
import { CreateGameDto } from '../dto/create-game.dto';
import { REDIS_KEY } from '../../common/constants/redis-key.constant';
import { generateUniquePin } from '../../common/utils/utils';
import { JoinRoomDto } from '../dto/join-room.dto';
import SocketEvents from '../../common/constants/socket-events';
import { UpdateRoomOptionDto } from '../dto/update-room-option.dto';
import { UpdateRoomQuizsetDto } from '../dto/update-room-quizset.dto';

@Injectable()
export class GameRoomService {
  private readonly logger = new Logger(GameRoomService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly gameValidator: GameValidator
  ) {}

  async createRoom(gameConfig: CreateGameDto, clientId: string): Promise<string> {
    const currentRoomPins = await this.redis.smembers(REDIS_KEY.ACTIVE_ROOMS);
    const roomId = generateUniquePin(currentRoomPins);

    await this.redis.hmset(REDIS_KEY.ROOM(roomId), {
      host: clientId,
      status: 'waiting',
      title: gameConfig.title,
      gameMode: gameConfig.gameMode,
      maxPlayerCount: gameConfig.maxPlayerCount.toString(),
      isPublicGame: gameConfig.isPublicGame ? '1' : '0',
      isWaiting: '1',
      lastActivityAt: new Date().getTime().toString(),
      quizSetId: '-1', // 미설정시 기본퀴즈를 진행, -1은 기본 퀴즈셋
      quizCount: '2',
      quizSetTitle: '기본 퀴즈셋'
      //todo : 기본 퀴즈셋 title 설정
    });

    await this.redis.sadd(REDIS_KEY.ACTIVE_ROOMS, roomId);
    this.logger.verbose(`게임 방 생성 완료: ${roomId}`);

    return roomId;
  }

  async joinRoom(dto: JoinRoomDto, clientId: string) {
    const roomKey = REDIS_KEY.ROOM(dto.gameId);
    const room = await this.redis.hgetall(roomKey);
    this.gameValidator.validateRoomExists(SocketEvents.JOIN_ROOM, room);

    const currentPlayers = await this.redis.smembers(REDIS_KEY.ROOM_PLAYERS(dto.gameId));
    this.gameValidator.validateRoomCapacity(
      SocketEvents.JOIN_ROOM,
      currentPlayers.length,
      parseInt(room.maxPlayerCount)
    );

    const playerKey = REDIS_KEY.PLAYER(clientId);
    const positionX = Math.random();
    const positionY = Math.random();

    await this.redis.set(`${playerKey}:Changes`, 'Join');
    await this.redis.hmset(playerKey, {
      playerName: dto.playerName,
      positionX: positionX.toString(),
      positionY: positionY.toString(),
      disconnected: '0',
      gameId: dto.gameId
    });

    await this.redis.zadd(REDIS_KEY.ROOM_LEADERBOARD(dto.gameId), 0, clientId);
    await this.redis.sadd(REDIS_KEY.ROOM_PLAYERS(dto.gameId), clientId);

    const players = [];
    for (const playerId of currentPlayers) {
      const player = await this.redis.hgetall(REDIS_KEY.PLAYER(playerId));
      players.push({
        playerId,
        playerName: player.playerName,
        playerPosition: [parseFloat(player.positionX), parseFloat(player.positionY)]
      });
    }

    this.logger.verbose(`게임 방 입장 완료: ${dto.gameId} - ${clientId} (${dto.playerName})`);

    return players;
  }

  async updateRoomOption(updateRoomOptionDto: UpdateRoomOptionDto, clientId: string) {
    const { gameId, gameMode, title, maxPlayerCount, isPublicGame } = updateRoomOptionDto;
    const roomKey = `Room:${gameId}`;

    const room = await this.redis.hgetall(roomKey);
    this.gameValidator.validateRoomExists(SocketEvents.UPDATE_ROOM_OPTION, room);

    this.gameValidator.validatePlayerIsHost(SocketEvents.UPDATE_ROOM_OPTION, room, clientId);

    await this.redis.set(`${roomKey}:Changes`, 'Option');
    await this.redis.hmset(roomKey, {
      title: title,
      gameMode: gameMode,
      maxPlayerCount: maxPlayerCount.toString(),
      isPublicGame: isPublicGame ? '1' : '0'
    });
    this.logger.verbose(`게임방 옵션 변경: ${gameId}`);
  }

  async updateRoomQuizset(updateRoomQuizsetDto: UpdateRoomQuizsetDto, clientId: string) {
    const { gameId, quizSetId, quizCount } = updateRoomQuizsetDto;
    const roomKey = `Room:${gameId}`;

    const room = await this.redis.hgetall(roomKey);
    this.gameValidator.validateRoomExists(SocketEvents.UPDATE_ROOM_QUIZSET, room);

    this.gameValidator.validatePlayerIsHost(SocketEvents.UPDATE_ROOM_QUIZSET, room, clientId);

    await this.redis.set(`${roomKey}:Changes`, 'Quizset');
    await this.redis.hmset(roomKey, {
      quizSetId: quizSetId.toString(),
      quizCount: quizCount.toString()
    });
    this.logger.verbose(`게임방 퀴즈셋 변경: ${gameId}`);
  }
}
