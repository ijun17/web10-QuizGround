import { Injectable } from '@nestjs/common';
import { RedisSubscriber } from './base.subscriber';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Server } from 'socket.io';
import SocketEvents from '../../constants/socket-events';

@Injectable()
export class PlayerSubscriber extends RedisSubscriber {
  constructor(@InjectRedis() redis: Redis) {
    super(redis);
  }

  async subscribe(server: Server): Promise<void> {
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

  private async handlePlayerChanges(key: string, playerId: string, server: Server) {
    const changes = await this.redis.get(`${key}:Changes`);
    const playerData = await this.redis.hgetall(key);

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
    }
  }

  private async handlePlayerJoin(playerId: string, playerData: any, server: Server) {
    const newPlayer = {
      playerId,
      playerName: playerData.playerName,
      playerPosition: [parseFloat(playerData.positionX), parseFloat(playerData.positionY)]
    };

    server.to(playerData.gameId).emit(SocketEvents.JOIN_ROOM, {
      players: [newPlayer]
    });
    this.logger.verbose(`Player joined: ${playerId} to game: ${playerData.gameId}`);
  }

  private async handlePlayerPosition(playerId: string, playerData: any, server: Server) {
    server.to(playerData.gameId).emit(SocketEvents.UPDATE_POSITION, {
      playerId,
      playerPosition: [parseFloat(playerData.positionX), parseFloat(playerData.positionY)]
    });
    this.logger.verbose(`Player position updated: ${playerId}`);
  }

  private async handlePlayerDisconnect(playerId: string, playerData: any, server: Server) {
    server.to(playerData.gameId).emit(SocketEvents.EXIT_ROOM, {
      playerId
    });
    this.logger.verbose(`Player disconnected: ${playerId} from game: ${playerData.gameId}`);
  }
}
