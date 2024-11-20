import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { ScoringSubscriber } from './subscribers/scoring.subscriber';
import { RedisSubscriber } from './subscribers/base.subscriber';
import { TimerSubscriber } from './subscribers/timer.subscriber';
import { RoomSubscriber } from './subscribers/room.subscriber';
import { PlayerSubscriber } from './subscribers/player.subscriber';
import { Server } from 'socket.io';

@Injectable()
export class RedisSubscriberService {
  private readonly logger = new Logger(RedisSubscriberService.name);
  private readonly subscribers: RedisSubscriber[] = [];

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly scoringSubscriber: ScoringSubscriber,
    private readonly timerSubscriber: TimerSubscriber,
    private readonly roomSubscriber: RoomSubscriber,
    private readonly playerSubscriber: PlayerSubscriber
  ) {
    this.subscribers = [scoringSubscriber, timerSubscriber, roomSubscriber, playerSubscriber];
  }

  async initializeSubscribers(server: Server) {
    // Redis Keyspace Notification 설정
    await this.redis.config('SET', 'notify-keyspace-events', 'KEhx');

    // 각 Subscriber 초기화
    for (const subscriber of this.subscribers) {
      await subscriber.subscribe(server);
      this.logger.verbose(`Initialized ${subscriber.constructor.name}`);
    }
  }
}
