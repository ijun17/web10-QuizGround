import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { REDIS_KEY } from '../common/constants/redis-key.constant';
import { CreateGameDto } from './dto/create-game.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { generateUniquePin } from '../common/utils/utils';
import { GameValidator } from './validations/game.validator';
import SocketEvents from '../common/constants/socket-events';

@Injectable()
export class GameService {
  private readonly logger = new Logger(GameService.name);

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
      lastActivityAt: new Date().getTime().toString()
    });

    await this.redis.sadd(REDIS_KEY.ACTIVE_ROOMS, roomId);
    this.logger.verbose(`게임 방 생성 완료: ${roomId}`);

    return roomId;
  }

  async joinRoom(dto: JoinRoomDto, clientId: string) {
    const roomKey = REDIS_KEY.ROOM(dto.gameId);
    const room = await this.redis.hgetall(roomKey);
    this.gameValidator.validateRoomExists(SocketEvents.JOIN_ROOM, room);

    const currentPlayers = await this.redis.keys(`Room:${dto.gameId}:Player:*`);
    this.gameValidator.validateRoomCapacity(SocketEvents.JOIN_ROOM, currentPlayers.length, parseInt(room.maxPlayerCount));

    const playerKey = REDIS_KEY.ROOM_PLAYER(dto.gameId, clientId);
    const positionX = Math.random();
    const positionY = Math.random();

    await this.redis.hmset(playerKey, {
      playerName: dto.playerName,
      positionX: positionX.toString(),
      positionY: positionY.toString(),
      disconnected: '0'
    });

    await this.redis.zadd(REDIS_KEY.ROOM_LEADERBOARD(dto.gameId), 0, clientId);

    const players = [];
    for (const playerKey of currentPlayers) {
      const playerId = playerKey.split(':').pop();
      const player = await this.redis.hgetall(playerKey);
      players.push({
        playerId,
        playerName: player.playerName,
        playerPosition: [parseFloat(player.positionX), parseFloat(player.positionY)]
      });
    }

    const newPlayer = {
      playerId: clientId,
      playerName: dto.playerName,
      playerPosition: [positionX, positionY]
    };

    this.logger.verbose(`게임 방 입장 완료: ${dto.gameId} - ${clientId} (${dto.playerName})`);

    return { players, newPlayer };
  }

  async updatePosition(updatePosition: UpdatePositionDto, clientId: string) {
    const { gameId, newPosition } = updatePosition;
    const playerKey = REDIS_KEY.ROOM_PLAYER(gameId, clientId);

    const player = await this.redis.hgetall(playerKey);
    this.gameValidator.validatePlayerInRoom(SocketEvents.UPDATE_POSITION, player);

    await this.redis.hmset(playerKey, {
      positionX: newPosition[0].toString(),
      positionY: newPosition[1].toString()
    });

    this.logger.verbose(
      `플레이어 위치 업데이트: ${gameId} - ${clientId} (${player.playerName}) = ${newPosition}`
    );

    return {
      playerId: clientId,
      playerPosition: newPosition
    };
  }

  async handleChatMessage(chatMessage: ChatMessageDto, clientId: string) {
    const { gameId, message } = chatMessage;
    const roomKey = REDIS_KEY.ROOM(gameId);

    const room = await this.redis.hgetall(roomKey);
    this.gameValidator.validateRoomExists(SocketEvents.CHAT_MESSAGE, room);

    const playerKey = REDIS_KEY.ROOM_PLAYER(gameId, clientId);
    const player = await this.redis.hgetall(playerKey);

    this.gameValidator.validatePlayerInRoom(SocketEvents.CHAT_MESSAGE, player);

    this.logger.verbose(
      `채팅 전송: ${gameId} - ${clientId} (${player.playerName}) = ${message}`
    );

    return {
      playerId: clientId,
      playerName: player.playerName,
      message,
      timestamp: new Date()
    };
  }
}