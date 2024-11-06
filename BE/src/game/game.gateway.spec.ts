import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { io, Socket } from 'socket.io-client';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';

describe('GameGateway (e2e)', () => {
  let app: INestApplication;
  let client1: Socket;
  let client2: Socket;
  let client3: Socket;

  const TEST_PORT = 3001;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GameGateway, GameService]
    }).compile();

    app = moduleRef.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.listen(TEST_PORT);
  });

  beforeEach((done) => {
    let connectedClients = 0;
    const onConnect = () => {
      connectedClients++;
      if (connectedClients === 3) {
        done();
      }
    };

    // 1. http(연결할때만) -> 2. ws
    client1 = io(`http://localhost:${TEST_PORT}/game`, {
      transports: ['websocket'],
      forceNew: true
    });
    client2 = io(`http://localhost:${TEST_PORT}/game`, {
      transports: ['websocket'],
      forceNew: true
    });
    client3 = io(`http://localhost:${TEST_PORT}/game`, {
      transports: ['websocket'],
      forceNew: true
    });

    client1.on('connect', onConnect);
    client2.on('connect', onConnect);
    client3.on('connect', onConnect);
  });

  afterEach(() => {
    client1.close();
    client2.close();
    client3.close();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('test', () => {
    it('test', async () => {
      const a = 1;
      expect(a).toBe(1);
    });
  });
});
