import { Test } from '@nestjs/testing';
import { IoAdapter } from '@nestjs/platform-socket.io';
import RedisMock from 'ioredis-mock';
import { AppModule } from '../../../src/app.module';

export const TEST_PORT = 3001;

export async function setupTestingModule() {
  const redisMock = new RedisMock();
  jest.spyOn(redisMock, 'config').mockImplementation(() => Promise.resolve('OK'));

  const originalHset = redisMock.hset.bind(redisMock);
  redisMock.hset = async function (key: string, ...args: any[]) {
    const result = await originalHset(key, ...args);
    await this.publish(`__keyspace@0__:${key}`, 'hset');
    return result;
  };

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  })
    .overrideProvider('default_IORedisModuleConnectionToken')
    .useValue(redisMock)
    .compile();

  const app = moduleRef.createNestApplication();
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.init();
  await app.listen(TEST_PORT);

  return { app, moduleRef, redisMock };
}