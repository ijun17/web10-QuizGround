import { Injectable, Logger, OnApplicationShutdown, OnModuleDestroy, Scope } from '@nestjs/common';
import { Namespace } from 'socket.io';
import { REDIS_KEY } from '../../common/constants/redis-key.constant';
import { SurvivalStatus } from '../../common/constants/game';
import Redis from 'ioredis';
import { MetricService } from '../../metric/metric.service';
import { InjectRedis } from '@nestjs-modules/ioredis';

export enum BatchProcessorType {
  DEFAULT = 'DEFAULT',
  ONLY_DEAD = 'ONLY_DEAD'
}

@Injectable({ scope: Scope.TRANSIENT })
export class BatchProcessor implements OnApplicationShutdown, OnModuleDestroy {
  private logger: Logger;
  private batchMap: Map<BatchProcessorType, Map<string, any[]>> = new Map();
  private metricMap: Map<BatchProcessorType, Map<string, any[]>> = new Map();
  private isProcessing = false;
  private intervalId: NodeJS.Timeout;

  private server: Namespace;
  private eventName: string;

  constructor(
    private readonly metricService: MetricService,
    @InjectRedis() private readonly redis: Redis
  ) {}

  initialize(server: Namespace, eventName: string) {
    this.server = server;
    this.eventName = eventName;
    this.logger = new Logger(`BatchProcessor:${this.eventName}`);
    for (const type of Object.values(BatchProcessorType)) {
      this.batchMap.set(type, new Map());
      this.metricMap.set(type, new Map());
    }
  }

  pushData(type: BatchProcessorType, gameId: string, data: any): void {
    const batchMap = this.batchMap.get(type);
    if (!batchMap.has(gameId)) {
      batchMap.set(gameId, []);
    }
    batchMap.get(gameId).push(data);
  }

  startMetric(type: BatchProcessorType, gameId: string): void {
    const metricMap = this.metricMap.get(type);
    if (!metricMap.has(gameId)) {
      metricMap.set(gameId, []);
    }
    metricMap.get(gameId).push(process.hrtime());
  }

  private batchProcessHandlers: Record<
    BatchProcessorType,
    (gameId: string, batch: any[]) => Promise<void>
  > = {
    [BatchProcessorType.DEFAULT]: async (gameId, batch) => {
      this.server.to(gameId).emit(this.eventName, batch);
    },
    [BatchProcessorType.ONLY_DEAD]: async (gameId, batch) => {
      const players = await this.redis.smembers(REDIS_KEY.ROOM_PLAYERS(gameId));
      const pipeline = this.redis.pipeline();
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
          const socket = this.server.sockets.get(player.socketId);
          if (!socket) {
            return;
          }
          socket.emit(this.eventName, batch);
        });
    }
  };

  private async processBatch(): Promise<void> {
    if (this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    try {
      for (const type of Object.values(BatchProcessorType)) {
        const batchMap = this.batchMap.get(type);
        const metricMap = this.metricMap.get(type);
        const processingTasks = Array.from(batchMap.entries()).map(async ([gameId, queue]) => {
          if (queue.length > 0) {
            const batch = queue.splice(0, queue.length);

            const handler = this.batchProcessHandlers[type];
            if (handler) {
              await handler(gameId, batch);
            } else {
              console.error('No handler found for value:', type);
            }

            this.logger.debug(`Processed ${batch.length} items for game ${gameId}`);
          }
        });

        const checkMetrics = Array.from(metricMap.entries()).map(async ([gameId, queue]) => {
          if (queue.length > 0) {
            const batch = queue.splice(0, queue.length);
            batch.forEach((startedAt) => {
              const endedAt = process.hrtime(startedAt);
              const delta = endedAt[0] * 1e9 + endedAt[1];
              const executionTime = delta / 1e6;
              this.metricService.recordResponse(this.eventName, 'success');
              this.metricService.recordLatency(this.eventName, 'response', executionTime);
            });
            this.logger.debug(`Checked ${batch.length} Metrics for game ${gameId}`);
          }
        });

        await Promise.all([...processingTasks, ...checkMetrics]);
      }
    } catch (error) {
      this.logger.error(`Error processing batch: ${error.message}`);
    } finally {
      this.isProcessing = false;
    }
  }

  startProcessing(interval: number = 100): void {
    this.intervalId = setInterval(() => this.processBatch(), interval);
    this.logger.verbose(
      `Started batch processor for ${this.eventName} with ${interval}ms interval`
    );
  }

  onModuleDestroy(): void {
    this.cleanUp();
  }

  onApplicationShutdown(): void {
    this.cleanUp();
  }

  private cleanUp(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.batchMap.clear();
    this.metricMap.clear();
    this.logger.verbose('Batch processor cleaned up');
  }
}
