import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { GameGateway } from '../src/game/game.gateway';
import { io, Socket } from 'socket.io-client';

describe('GameGateway (e2e)', () => {
  let app: INestApplication;
  let client1: Socket;
  let client2: Socket;

  const TEST_PORT = 3001;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GameGateway],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.listen(TEST_PORT);
  });

  beforeEach((done) => {
    client1 = io(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket'],
      forceNew: true,
    });

    client2 = io(`http://localhost:${TEST_PORT}`, {
      transports: ['websocket'],
      forceNew: true,
    });

    client1.on('connect', () => {
      client2.on('connect', done);
    });
  });

  afterEach(() => {
    client1.close();
    client2.close();
  });

  afterAll(async () => {
    await app.close();
  });

  it('게임방 생성 테스트', async () => {
    // emit이 비동기로 작동하기에 Promise로 깜싸줘서 처리
    const roomId = await new Promise<string>((resolve) => {
      client1.emit('createGame', (roomId: string) => {
        resolve(roomId);
      });
    });

    client1.emit('joinGame', roomId);
  });

  it('존재하지 않는 방 참여시 에러 메시지 테스트', (done) => {
    client1.on('error', (message) => {
      expect(message).toBe('[ERROR] 존재하지 않는 게임 방입니다.');
      done();
    });

    client1.emit('joinGame', 'non-existent-room');
  });

  it('여러 클라이언트 게임방 참여 테스트', async () => {
    const roomId = await new Promise<string>((resolve) => {
      client1.emit('createGame', (roomId: string) => {
        resolve(roomId);
      });
    });

    client2.emit('joinGame', roomId);
  });
});