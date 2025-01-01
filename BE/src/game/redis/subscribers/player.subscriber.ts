import { Injectable } from '@nestjs/common';
import { RedisSubscriber } from './base.subscriber';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Namespace } from 'socket.io';
import SocketEvents from '../../../common/constants/socket-events';
import { REDIS_KEY } from '../../../common/constants/redis-key.constant';
import { SurvivalStatus } from '../../../common/constants/game';
import { BatchProcessor, BatchProcessorType } from '../../service/batch.processor';
import { POSITION_BATCH_TIME } from '../../../common/constants/batch-time';

@Injectable()
export class PlayerSubscriber extends RedisSubscriber {
  constructor(
    @InjectRedis() redis: Redis,
    private positionProcessor: BatchProcessor
  ) {
    super(redis);
  }

  async subscribe(server: Namespace): Promise<void> {
    this.positionProcessor.initialize(server, SocketEvents.UPDATE_POSITION);
    this.positionProcessor.startProcessing(POSITION_BATCH_TIME);

    const subscriber = this.redis.duplicate();
    await subscriber.psubscribe('__keyspace@0__:Player:*');

    subscriber.on('pmessage', async (_pattern, channel, message) => {
      const playerId = this.extractPlayerId(channel);
      if (!playerId || message !== 'hset') {
        return;
      }

      const playerKey = REDIS_KEY.PLAYER(playerId);
      const changes = await this.redis.get(`${playerKey}:Changes`);

      await this.handlePlayerChanges(changes, playerId, server);
    });
  }

  private extractPlayerId(channel: string): string | null {
    const splitKey = channel.replace('__keyspace@0__:', '').split(':');
    return splitKey.length === 2 ? splitKey[1] : null;
  }

  private async handlePlayerChanges(changes: string, playerId: string, server: Namespace) {
    const playerKey = REDIS_KEY.PLAYER(playerId);
    const playerData = await this.redis.hgetall(playerKey);
    const result = { changes, playerData };

    switch (changes) {
      case 'Join':
        await this.handlePlayerJoin(playerId, playerData, server);
        break;

      case 'Position':
        await this.handlePlayerPosition(playerId, playerData);
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

    return result;
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

  private async handlePlayerPosition(playerId: string, playerData: any) {
    const { gameId, positionX, positionY } = playerData;
    const playerPosition = [parseFloat(positionX), parseFloat(positionY)];
    const updateData = { playerId, playerPosition };

    const isAlivePlayer = await this.redis.hget(REDIS_KEY.PLAYER(playerId), 'isAlive');

    if (isAlivePlayer === SurvivalStatus.ALIVE) {
      this.positionProcessor.logMetricStart(BatchProcessorType.DEFAULT, gameId);
      this.positionProcessor.pushData(BatchProcessorType.DEFAULT, gameId, updateData);
    } else if (isAlivePlayer === SurvivalStatus.DEAD) {
      this.positionProcessor.logMetricStart(BatchProcessorType.ONLY_DEAD, gameId);
      this.positionProcessor.pushData(BatchProcessorType.ONLY_DEAD, gameId, updateData);
    }
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
