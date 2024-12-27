/**
 * @fileoverview Functional batch processor factory
 */
import { Namespace } from 'socket.io';
import { Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_KEY } from '../../common/constants/redis-key.constant';
import { SurvivalStatus } from '../../common/constants/game';

export enum BatchProcessorType {
  'DEFAULT',
  'ONLY_DEAD'
}

/**
 * Creates a batch processor instance
 */
export function createBatchProcessor(
  server: Namespace,
  eventName: string,
  type: BatchProcessorType,
  redis: Redis
) {
  const logger = new Logger(`BatchProcessor:${eventName}`);

  const batchMap = new Map<string, any[]>();
  let isProcessing = false;

  /**
   * Pushes data to batch queue
   */
  const pushData = (gameId: string, data: any) => {
    if (!batchMap.has(gameId)) {
      batchMap.set(gameId, []);
    }
    batchMap.get(gameId).push(data);
  };

  /**
   * Processes and emits all batched data
   */
  const processBatch = () => {
    if (isProcessing) {
      return;
    }

    isProcessing = true;
    try {
      batchMap.forEach(async (queue, gameId) => {
        if (queue.length > 0) {
          const batch = queue.splice(0, queue.length);

          if (type === BatchProcessorType.DEFAULT) {
            server.to(gameId).emit(eventName, batch);
          } else if (type === BatchProcessorType.ONLY_DEAD) {
            const players = await redis.smembers(REDIS_KEY.ROOM_PLAYERS(gameId));
            const pipeline = redis.pipeline();
            players.forEach((id) => {
              pipeline.hmget(REDIS_KEY.PLAYER(id), 'isAlive', 'socketId');
            });

            type Result = [Error | null, [string, string] | null];
            const results = await pipeline.exec();

            (results as Result[])
              .map(([err, data], index) => ({
                id: players[index],
                isAlive: err ? null : data?.[0],
                socketId: err ? null : data?.[1]
              }))
              .filter((player) => player.isAlive === SurvivalStatus.DEAD)
              .forEach((player) => {
                const socket = server.sockets.get(player.socketId);
                if (!socket) {
                  return;
                }
                socket.emit(eventName, batch);
              });
          }
          logger.debug(`Processed ${batch.length} items for game ${gameId}`);
        }
      });
    } catch (error) {
      logger.error(`Error processing batch: ${error.message}`);
    } finally {
      isProcessing = false;
    }
  };

  /**
   * Starts automatic batch processing
   */
  const startProcessing = (interval: number = 100) => {
    setInterval(processBatch, interval);
    logger.verbose(`Started batch processor for ${eventName} with ${interval}ms interval`);
  };

  /**
   * Clears all batched data
   */
  const clear = () => {
    batchMap.clear();
  };

  // 외부에서 사용할 수 있는 public 메서드만 노출
  return {
    pushData,
    processBatch,
    startProcessing,
    clear
  };
}
