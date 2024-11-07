import { createClient } from 'redis';
import * as config from 'config';

const getRedisConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development';

  const redisHost = isDevelopment ? config.get('redis-db').host : process.env.REDIS_HOST;

  const redisPort = isDevelopment ? config.get('redis-db').port : process.env.REDIS_PORT;

  return {
    host: redisHost,
    port: redisPort
  };
};

const { host, port } = getRedisConfig();

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

RedisClient.on('error', (err) => console.error('Redis 클라이언트 에러:', err));
RedisClient.on('connect', () => console.log('Redis에 연결되었습니다.'));
RedisClient.on('reconnecting', () => console.log('Redis에 재연결 중...'));

(async () => {
  await RedisClient.connect();
})();
