import { SocketTestHelper } from '../setup/socket.helper';
import { setupTestingModule } from '../setup/game.setup';
import socketEvents from '../../../src/common/constants/socket-events';

describe('Game Chat 통합테스트', () => {
  let app;
  let redisMock;
  let socketHelper: SocketTestHelper;
  let client1Id, client2Id, client3Id;
  let client1, client2, client3;
  let port;
  let gameId;

  beforeAll(async () => {
    const setup = await setupTestingModule();
    app = setup.app;
    redisMock = setup.redisMock;
    port = setup.port;
    socketHelper = new SocketTestHelper();
  });

  beforeEach(async () => {
    await redisMock.flushall();

    const result = await socketHelper.connectClients(port, 3);
    gameId = result.gameId;
    const clientsEntries = Array.from(result.clients.entries());
    [client1Id, client1] = clientsEntries[0];
    [client2Id, client2] = clientsEntries[1];
    [client3Id, client3] = clientsEntries[2];
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

  describe('chatMessage 이벤트 테스트', () => {
    it('같은 방의 모든 플레이어에게 메시지 전송', async () => {
      // const createResponse = await createRoom(client1);
      // const joinResponse = await joinRoom(client2, createResponse.gameId);
      // const joinResponse2 = await joinRoom(client3, createResponse.gameId);

      const testMessage = 'Hello, everyone!';
      const messagePromises = [
        new Promise<any>((resolve) => client1.once(socketEvents.CHAT_MESSAGE, resolve)),
        new Promise<any>((resolve) => client2.once(socketEvents.CHAT_MESSAGE, resolve))
      ];

      client1.emit(socketEvents.CHAT_MESSAGE, {
        gameId: gameId,
        message: testMessage
      });

      const receivedMessages = await Promise.all(messagePromises);
      receivedMessages.forEach((msg) => {
        expect(msg.message).toBe(testMessage);
        expect(msg.playerName).toBe('닉네임 설정 이전');
      });
    });
  });
});
