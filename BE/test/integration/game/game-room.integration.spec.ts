import { SocketTestHelper } from '../setup/socket.helper';
import { setupTestingModule } from '../setup/game.setup';
import { createRoom, joinRoom } from '../setup/util';
import socketEvents from '../../../src/common/constants/socket-events';

describe('Game Room 통합테스트', () => {
  let app;
  let redisMock;
  let socketHelper: SocketTestHelper;
  let client1, client2, client3;
  let port;

  beforeAll(async () => {
    const setup = await setupTestingModule();
    app = setup.app;
    redisMock = setup.redisMock;
    port = setup.port;
    socketHelper = new SocketTestHelper();
  });

  beforeEach(async () => {
    await redisMock.flushall();

    [client1, client2, client3] = await socketHelper.connectClients(port, 3);
  });

  afterEach(async () => {
    await socketHelper.disconnectAll();
    await redisMock.flushall();
  });

  afterAll(async () => {
    if (app) {
      await app.close();
    }
  });

  describe('createRoom 이벤트 테스트', () => {
    it('유효한 설정으로 게임방 생성 성공', async () => {
      const createResponse = await createRoom(client1);

      expect(createResponse.gameId).toBeDefined();
      expect(typeof createResponse.gameId).toBe('string');

      // 실제 Redis 저장 확인
      const roomData = await redisMock.hgetall(`Room:${createResponse.gameId}`);
      expect(roomData).toBeDefined();
      expect(roomData.title).toBeDefined();
      expect(roomData.gameMode).toBeDefined();
      expect(roomData.maxPlayerCount).toBeDefined();
    });
  });

  describe('createRoom 이벤트 실패 케이스', () => {
    test.each([
      [
        '빈 title',
        { title: '', gameMode: 'RANKING', maxPlayerCount: 2, isPublic: true }
      ],
      [
        '빈 gameMode',
        { title: 'hello', gameMode: '', maxPlayerCount: 2, isPublic: true }
      ],
      [
        '잘못된 gameMode',
        { title: 'hello', gameMode: 'invalid', maxPlayerCount: 2, isPublic: true }
      ],
      [
        '최소 인원 미달',
        { title: 'hello', gameMode: 'RANKING', maxPlayerCount: 0, isPublic: true }
      ]
    ])('%s인 경우 에러 발생', async (testCase, config) => {
      const errorPromise = new Promise(resolve => {
        client1.once('exception', resolve);
      });

      client1.emit(socketEvents.CREATE_ROOM, config);

      const error = await errorPromise as any;
      expect(error).toBeDefined();
      expect(error.eventName).toBe(socketEvents.CREATE_ROOM);
    });
  });

  describe('joinRoom 이벤트 테스트', () => {
    it('존재하는 방 참여 성공', async () => {
      const createResponse = await createRoom(client1);
      const joinResponse = await joinRoom(client2, createResponse.gameId);

      expect(joinResponse.players).toBeDefined();

      // Redis에서 플레이어 정보 확인
      const playerData = await redisMock.hgetall(`Player:${client2.id}`);
      expect(playerData).toBeDefined();
      expect(playerData.playerName).toBe('TestPlayer');
    });

    it('존재하지 않는 방 참여 실패', (done) => {
      client1.once('exception', (error) => {
        expect(error.eventName).toBe('joinRoom');
        expect(error.message).toBe('존재하지 않는 게임 방입니다.');
        done();
      });

      client1.emit(socketEvents.JOIN_ROOM, {
        gameId: '999999',
        playerName: 'TestPlayer'
      });
    });

    // TODO: JOIN_ROOM 바꾼 후 테스트 코드 변경 필요
    // it('게임 진행 중인 방 참여 실패', async (done) => {
    //   let gameId: string;
    //
    //   // exception 이벤트 리스너 먼저 등록
    //   client2.once('exception', (error) => {
    //     try {
    //       expect(error.eventName).toBe('joinRoom');
    //       expect(error.message).toBe(ExceptionMessage.GAME_ALREADY_STARTED);
    //       done();
    //     } catch (err) {
    //       done(err);
    //     }
    //   });
    //
    //   // 방 생성
    //   const createResponse = await new Promise<{ gameId: string }>((resolve) => {
    //     client1.once(socketEvents.CREATE_ROOM, resolve);
    //     client1.emit(socketEvents.CREATE_ROOM, {
    //       title: 'Test Room',
    //       gameMode: 'RANKING',
    //       maxPlayerCount: 5,
    //       isPublic: true
    //     });
    //   });
    //
    //   client1.once(socketEvents.JOIN_ROOM, () => {
    //     // 게임 시작
    //     client1.emit(socketEvents.START_GAME, { gameId });
    //   });
    //
    //   // 방 참여
    //   const joinResponse = await new Promise<any>((resolve) => {
    //     client2.once(socketEvents.JOIN_ROOM, resolve);
    //     client2.emit(socketEvents.JOIN_ROOM, {
    //       gameId: createResponse.gameId,
    //       playerName: 'TestPlayer'
    //     });
    //   });
    //
    // });
  });
});