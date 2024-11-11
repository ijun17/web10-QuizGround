import { createClient } from 'redis';
import * as process from 'node:process';
import { Logger } from '@nestjs/common';

const host = process.env.REDIS_HOST || 'localhost';
const port = process.env.REDIS_PORT || 6379;
const logger = new Logger('RedisClient');
export const RedisClient = createClient({
  url: `redis://${host}:${port}`,
  socket: {
    reconnectStrategy: (retries) => {
      if (retries > 10) {
        console.error('Redis 연결 최대 재시도 횟수 초과');
        return new Error('Redis 연결 실패');
      }
      return Math.min(retries * 100, 3000);
    }
  }
});

RedisClient.on('error', (err) => logger.verbose('Redis 클라이언트 에러:', err));
RedisClient.on('connect', () => logger.verbose('Redis에 연결되었습니다.'));
RedisClient.on('reconnecting', () => logger.verbose('Redis에 재연결 중...'));

(async () => {
  await RedisClient.connect();
})();
