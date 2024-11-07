import { Test } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { io, Socket } from 'socket.io-client';
import { GameGateway } from '../src/game/game.gateway';
import { GameService } from '../src/game/game.service';
import socketEvents from '../src/common/constants/socket-events';

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

  describe('createRoom 이벤트 테스트', () => {
    it('유효한 설정으로 게임방 생성 성공', async () => {
      const gameConfig = {
        title: 'hello world!',
        gameMode: 'RANKING',
        maxPlayerCount: 2,
        isPublicGame: true
      };

      const response = await new Promise<{ gameId: string }>((resolve) => {
        client1.once(socketEvents.CREATE_ROOM, resolve);
        client1.emit(socketEvents.CREATE_ROOM, gameConfig);
      });

      // expect(response.status).toBe('success');
      expect(response.gameId).toBeDefined();
      expect(typeof response.gameId).toBe('string');
    });

    const invalidConfigs = [
      {
        case: '빈 title',
        config: { title: '', gameMode: '', maxPlayerCount: 2, isPublicGame: true }
      },
      {
        case: '빈 gameMode',
        config: { title: 'hello', gameMode: '', maxPlayerCount: 2, isPublicGame: true }
      },
      {
        case: '잘못된 gameMode',
        config: { title: 'hello', gameMode: 'invalid', maxPlayerCount: 2, isPublicGame: true }
      },
      {
        case: '최소 인원 미달',
        config: { title: 'hello', gameMode: 'ranking', maxPlayerCount: 0, isPublicGame: true }
      },
      {
        case: '최대 인원 초과',
        config: { title: 'hello', gameMode: 'ranking', maxPlayerCount: 201, isPublicGame: true }
      },
      {
        case: '잘못된 boolean 타입',
        config: { title: 'hello', gameMode: 'ranking', maxPlayerCount: 2, isPublicGame: '안녕' }
      }
    ];

    invalidConfigs.forEach(({ case: testCase, config }) => {
      it(testCase, (done) => {
        client1.once('exception', (error) => {
          expect(error).toBeDefined();
          expect(error.status).toBe('error');
          expect(error.message).toBeDefined();
          done();
        });

        client1.emit(socketEvents.CREATE_ROOM, config);
      });
    });

    it('방생성시 서버는 올바른 6자리 숫자(PIN)을 응답해야한다.', async () => {
      // Promise와 함께 once 사용
      const response = await new Promise<{ gameId: string }>((resolve) => {
        // CREATE_ROOM 이벤트의 응답을 한 번만 기다림
        client1.once(socketEvents.CREATE_ROOM, resolve);

        // 이벤트 발생
        client1.emit(socketEvents.CREATE_ROOM, {
          title: 'Test Room',
          gameMode: 'RANKING',
          maxPlayerCount: 5,
          isPublicGame: true
        });
      });

      // 6자리 숫자 검증
      expect(response.gameId).toBeDefined();
      expect(response.gameId).toMatch(/^\d{6}$/); // 정확히 6자리 숫자만

      // 범위 검증 (100000-999999)
      const pinNumber = parseInt(response.gameId);
      expect(pinNumber).toBeGreaterThanOrEqual(100000);
      expect(pinNumber).toBeLessThanOrEqual(999999);
    });
  });

  describe('chatMessage 이벤트 테스트', () => {
    it('같은 Room의 플레이어들에게 브로드캐스팅 성공', async () => {
      /*given*/
      // 게임방 생성 로직
      const createRoomResponse = await new Promise<{ gameId: string }>((resolve) => {
        client1.once(socketEvents.CREATE_ROOM, resolve);
        client1.emit(socketEvents.CREATE_ROOM, {
          title: 'hello world!',
          gameMode: 'RANKING',
          maxPlayerCount: 5,
          isPublicGame: true
        });
      });

      // 게임방 참여 로직
      const joinRoomResponse1 = await new Promise<any>((resolve) => {
        client1.once(socketEvents.JOIN_ROOM, resolve);
        client1.emit(socketEvents.JOIN_ROOM, {
          gameId: createRoomResponse.gameId,
          playerName: '시크릿주주1'
        });
      });
      const joinRoomResponse2 = await new Promise<any>((resolve) => {
        client2.once(socketEvents.JOIN_ROOM, resolve);
        client2.emit(socketEvents.JOIN_ROOM, {
          gameId: createRoomResponse.gameId,
          playerName: '시크릿주주2'
        });
      });
      const joinRoomResponse3 = await new Promise<any>((resolve) => {
        client3.once(socketEvents.JOIN_ROOM, resolve);
        client3.emit(socketEvents.JOIN_ROOM, {
          gameId: createRoomResponse.gameId,
          playerName: '시크릿주주3'
        });
      });

      const messageToSend = '안녕하세요! 여러분!';
      const receivedCount = 0;
      const chatMessageResponse = await new Promise<any>((resolve) => {
        const responseList = [];
        client1.once(socketEvents.CHAT_MESSAGE, (payload) => {
          responseList.push(payload);
          if (responseList.length === 3) {
            resolve(responseList);
          }
        });
        client2.once(socketEvents.CHAT_MESSAGE, (payload) => {
          responseList.push(payload);
          if (responseList.length === 3) {
            resolve(responseList);
          }
        });
        client3.once(socketEvents.CHAT_MESSAGE, (payload) => {
          responseList.push(payload);
          if (responseList.length === 3) {
            resolve(responseList);
          }
        });
        client1.emit(socketEvents.CHAT_MESSAGE, {
          gameId: createRoomResponse.gameId,
          message: messageToSend
        });
      });

      expect(chatMessageResponse[0].message).toBe(messageToSend);
    });
  });

  describe('updatePosition 이벤트 테스트', () => {
    it('유효한 설정을주면 위치 업데이트를 성공 해야 한다.', async () => {
      const createRoomResponse = await new Promise<{ gameId: string }>((resolve) => {
        client1.once(socketEvents.CREATE_ROOM, resolve);
        client1.emit(socketEvents.CREATE_ROOM, {
          title: 'hello world!',
          gameMode: 'RANKING',
          maxPlayerCount: 5,
          isPublicGame: true
        });
      });

      const joinRoomResponse = await new Promise<any>((resolve) => {
        client1.once(socketEvents.JOIN_ROOM, resolve);
        client1.emit(socketEvents.JOIN_ROOM, {
          gameId: createRoomResponse.gameId,
          playerName: '시크릿주주1'
        });
      });

      const newPosition = [1, 1];
      const updatePositionResponse = await new Promise<any>((resolve) => {
        client1.once(socketEvents.UPDATE_POSITION, resolve);
        client1.emit(socketEvents.UPDATE_POSITION, {
          gameId: createRoomResponse.gameId,
          newPosition: newPosition
        });
      });

      expect(updatePositionResponse).toBeDefined();
      expect(updatePositionResponse.playerId).toBe(client1.id);
      expect(updatePositionResponse.playerPosition).toEqual(newPosition);
    });

    it('update DTO에 잘못된값이 있는경우 error를 내야한다.', (done) => {
      client1.once('exception', (error) => {
        expect(error).toBeDefined();
        expect(error.message).toBe('PIN번호는 6자리이어야 합니다.');
        done();
      });

      client1.emit(socketEvents.UPDATE_POSITION, {
        gameId: '',
        newPosition: []
      });
    });

    it('해당방의 플레이어가 아닌경우 error를 내야한다.', async () => {
      client2.once('error', (error) => {
        expect(error).toBeDefined();
        expect(error).toBe('[ERROR] 해당 게임 방의 플레이어가 아닙니다.');
      });

      const createRoomResponse = await new Promise<{ gameId: string }>((resolve) => {
        client1.once(socketEvents.CREATE_ROOM, resolve);
        client1.emit(socketEvents.CREATE_ROOM, {
          title: 'hello world!',
          gameMode: 'RANKING',
          maxPlayerCount: 5,
          isPublicGame: true
        });
      });

      const newPosition = [1, 1];

      client2.emit(socketEvents.UPDATE_POSITION, {
        gameId: createRoomResponse.gameId,
        newPosition: newPosition
      });
    });
  });

  describe('startGame 이벤트 테스트', () => {
    it('방장이 게임을 시작할 수 있어야 한다.', async () => {
      const createRoomResponse = await new Promise<{ gameId: string }>((resolve) => {
        client1.once(socketEvents.CREATE_ROOM, resolve);
        client1.emit(socketEvents.CREATE_ROOM, {
          title: 'Test Room',
          gameMode: 'RANKING',
          maxPlayerCount: 5,
          isPublicGame: true
        });
      });

      const joinRoomResponse = await new Promise<any>((resolve) => {
        client1.once(socketEvents.JOIN_ROOM, resolve);
        client1.emit(socketEvents.JOIN_ROOM, {
          gameId: createRoomResponse.gameId,
          playerName: 'HostPlayer'
        });
      });

      const startGameResponse = await new Promise<void>((resolve) => {
        client1.once(socketEvents.START_GAME, resolve);
        client1.emit(socketEvents.START_GAME, createRoomResponse.gameId);
      });

      expect(startGameResponse).toBeUndefined();
    });

    it('방장이 아닌 플레이어는 게임을 시작할 수 없어야 한다.', async () => {
      const createRoomResponse = await new Promise<{ gameId: string }>((resolve) => {
        client1.once(socketEvents.CREATE_ROOM, resolve);
        client1.emit(socketEvents.CREATE_ROOM, {
          title: 'Test Room',
          gameMode: 'RANKING',
          maxPlayerCount: 5,
          isPublicGame: true
        });
      });

      const joinRoomResponse1 = await new Promise<any>((resolve) => {
        client1.once(socketEvents.JOIN_ROOM, resolve);
        client1.emit(socketEvents.JOIN_ROOM, {
          gameId: createRoomResponse.gameId,
          playerName: 'HostPlayer'
        });
      });

      const joinRoomResponse2 = await new Promise<any>((resolve) => {
        client2.once(socketEvents.JOIN_ROOM, resolve);
        client2.emit(socketEvents.JOIN_ROOM, {
          gameId: createRoomResponse.gameId,
          playerName: 'NonHostPlayer'
        });
      });

      client2.once('error', (error) => {
        expect(error).toBeDefined();
        expect(error).toBe('[ERROR] 방장만 게임을 시작할 수 있습니다.');
      });

      client2.emit(socketEvents.START_GAME, createRoomResponse.gameId);
    });
  });
});
