import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';

export interface ResponseTimeMetric {
  timestamp: Date;
  eventType: string;
  responseTime: number;
}

@Injectable()
export class MetricStorageService {
  private readonly METRICS_KEY = 'metrics:current';
  private readonly ENABLED_KEY = 'metrics:enabled';

  constructor(@InjectRedis() private readonly redis: Redis) {}

  async startCollecting() {
    await this.redis.set(this.ENABLED_KEY, '1');
    await this.redis.del(this.METRICS_KEY);
  }

  async addMetric(metric: ResponseTimeMetric) {
    const isEnabled = await this.isCollecting();
    if (isEnabled) {
      await this.redis.rpush(this.METRICS_KEY, JSON.stringify(metric));
    }
  }

  async stopAndGetMetrics(): Promise<ResponseTimeMetric[]> {
    await this.redis.set(this.ENABLED_KEY, '0');
    const metrics = await this.redis.lrange(this.METRICS_KEY, 0, -1);
    return metrics.map(m => JSON.parse(m));
  }

  async isCollecting(): Promise<boolean> {
    const enabled = await this.redis.get(this.ENABLED_KEY);
    return enabled === '1';
  }
}