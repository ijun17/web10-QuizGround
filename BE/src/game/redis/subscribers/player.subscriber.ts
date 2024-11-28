import { Injectable } from '@nestjs/common';
import { RedisSubscriber } from './base.subscriber';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Namespace } from 'socket.io';
import SocketEvents from '../../../common/constants/socket-events';
import { REDIS_KEY } from '../../../common/constants/redis-key.constant';

@Injectable()
export class PlayerSubscriber extends RedisSubscriber {
  constructor(@InjectRedis() redis: Redis) {
    super(redis);
  }

  async subscribe(server: Namespace): Promise<void> {
    const subscriber = this.redis.duplicate();
    await subscriber.psubscribe('__keyspace@0__:Player:*');

    subscriber.on('pmessage', async (_pattern, channel, message) => {
      const playerId = this.extractPlayerId(channel);
      if (!playerId || message !== 'hset') {
        return;
      }
      const key = `Player:${playerId}`;
      await this.handlePlayerChanges(key, playerId, server);
    });
  }

  private extractPlayerId(channel: string): string | null {
    const splitKey = channel.replace('__keyspace@0__:', '').split(':');
    return splitKey.length === 2 ? splitKey[1] : null;
  }

  private async handlePlayerChanges(key: string, playerId: string, server: Namespace) {
    const changes = await this.redis.get(`${key}:Changes`);
    const playerKey = REDIS_KEY.PLAYER(playerId);
    const playerData = await this.redis.hgetall(playerKey);

    switch (changes) {
      case 'Join':
        await this.handlePlayerJoin(playerId, playerData, server);
        break;

      case 'Position':
        await this.handlePlayerPosition(playerId, playerData, server);
        break;

      case 'Disconnect':
        await this.handlePlayerDisconnect(playerId, playerData, server);
        break;

      case 'Name':
        await this.handlePlayerName(playerId, playerData, server);
        break;

      case 'Kicked':
        await this.handlePlayerKicked(playerId, playerData, server);
        break;
    }
  }

  private async handlePlayerJoin(playerId: string, playerData: any, server: Namespace) {
    const findRoom = await this.redis.hgetall(REDIS_KEY.ROOM(playerData.gameId));
    const findHost = findRoom.host;
    const isHost = findHost === playerId;

    const newPlayer = {
      playerId,
      playerName: playerData.playerName,
      playerPosition: [parseFloat(playerData.positionX), parseFloat(playerData.positionY)],
      isHost
    };

    server.to(playerData.gameId).emit(SocketEvents.JOIN_ROOM, {
      players: [newPlayer]
    });
    this.logger.verbose(`Player joined: ${playerId} to game: ${playerData.gameId}`);
  }

  private async handlePlayerPosition(playerId: string, playerData: any, server: Namespace) {
    const { gameId, positionX, positionY } = playerData;
    const playerPosition = [parseFloat(positionX), parseFloat(positionY)];
    const updateData = { playerId, playerPosition };

    const isAlivePlayer = await this.redis.hget(REDIS_KEY.PLAYER(playerId), 'isAlive');

    if (isAlivePlayer === '1') {
      server.to(gameId).emit(SocketEvents.UPDATE_POSITION, updateData);
    } else if (isAlivePlayer === '0') {
      const players = await this.redis.smembers(REDIS_KEY.ROOM_PLAYERS(gameId));
      const deadPlayers = await Promise.all(
        players.map(async (id) => {
          const isAlive = await this.redis.hget(REDIS_KEY.PLAYER(id), 'isAlive');
          return { id, isAlive };
        })
      );

      deadPlayers
        .filter((player) => player.isAlive === '0')
        .forEach((player) => {
          server.to(player.id).emit(SocketEvents.UPDATE_POSITION, updateData);
        });
    }

    this.logger.verbose(
      `[updatePosition] RoomId: ${gameId} | playerId: ${playerId} | isAlive: ${isAlivePlayer === '1' ? '생존자' : '관전자'} | position: [${positionX}, ${positionY}]`
    );
  }

  private async handlePlayerDisconnect(playerId: string, playerData: any, server: Namespace) {
    server.to(playerData.gameId).emit(SocketEvents.EXIT_ROOM, {
      playerId
    });
    this.logger.verbose(`Player disconnected: ${playerId} from game: ${playerData.gameId}`);
  }

  private async handlePlayerName(playerId: string, playerData: any, server: Namespace) {
    server.to(playerData.gameId).emit(SocketEvents.SET_PLAYER_NAME, {
      playerId,
      playerName: playerData.playerName
    });
    this.logger.verbose(
      `Player Name Change: ${playerData.playerName} ${playerId} from game: ${playerData.gameId}`
    );
  }

  private async handlePlayerKicked(playerId: string, playerData: any, server: Namespace) {
    server.to(playerData.gameId).emit(SocketEvents.KICK_ROOM, {
      playerId
    });
    this.logger.verbose(`Player kicked: ${playerId} from game: ${playerData.gameId}`);
    //클라에서 exitRoom도 주기를 원함
    await this.handlePlayerDisconnect(playerId, playerData, server);
  }
}
