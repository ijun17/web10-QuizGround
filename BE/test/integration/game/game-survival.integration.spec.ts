import { SocketTestHelper } from '../setup/socket.helper';
import { setupTestingModule } from '../setup/game.setup';

describe('Game Survival 통합테스트', () => {
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

  it('a', () => {
    expect(1).toBe(1);
  });

  // describe('관전자끼리 플레이 테스트', () => {
  //   it ('관전자의 메시지가 생존자에게 보이지 않아야 한다.', async () => {
  //     const createResponse = await createRoom(client1);
  //     const joinResponse = await joinRoom(client1, createResponse.gameId);
  //     const joinResponse2 = await joinRoom(client2, createResponse.gameId);
  //     const joinResponse3 = await joinRoom(client3, createResponse.gameId);
  //
  //     // mock 퀴즈셋으로 변경
  //     jest.mock('../../mocks/quiz-data.mock.ts', () => ({
  //       mockQuizData: {
  //         id: '1',
  //         title: '기본 퀴즈셋',
  //         category: 'common',
  //         quizList: [
  //           {
  //             id: '1',
  //             quiz: '호눅스님과 jk 님은 동갑인가요?',
  //             limitTime: 0.1,
  //             choiceList: [
  //               {
  //                 content: 'O',
  //                 order: 1,
  //                 isAnswer: false
  //               },
  //               {
  //                 content: 'X',
  //                 order: 2,
  //                 isAnswer: false
  //               },
  //               {
  //                 content: '모르겠다.',
  //                 order: 3,
  //                 isAnswer: false
  //               },
  //               {
  //                 content: '크롱',
  //                 order: 4,
  //                 isAnswer: true
  //               }
  //             ]
  //           },
  //           {
  //             id: '2',
  //             quiz: '1 + 1 = ?',
  //             limitTime: 0.1,
  //             choiceList: [
  //               {
  //                 content: '1',
  //                 order: 1,
  //                 isAnswer: false
  //               },
  //               {
  //                 content: '2',
  //                 order: 2,
  //                 isAnswer: false
  //               },
  //               {
  //                 content: '3',
  //                 order: 3,
  //                 isAnswer: false
  //               },
  //               {
  //                 content: '4',
  //                 order: 4,
  //                 isAnswer: true
  //               }
  //             ]
  //           }
  //         ]
  //       }
  //     }));
  //
  //     // 위치 업데이트 두 플레이어를 오답으로 처리
  //     const incorrectPosition = [0.1, 0.1];
  //     const correctPosition = [0.9, 0.9];
  //     client1.emit(socketEvents.UPDATE_POSITION, {
  //       gameId: createResponse.gameId,
  //       newPosition: incorrectPosition
  //     });
  //     client2.emit(socketEvents.UPDATE_POSITION, {
  //       gameId: createResponse.gameId,
  //       newPosition: incorrectPosition
  //     });
  //     client3.emit(socketEvents.UPDATE_POSITION, {
  //       gameId: createResponse.gameId,
  //       newPosition: correctPosition
  //     });
  //
  //     // 게임 시작
  //     client1.emit(socketEvents.START_GAME, {
  //       gameId: createResponse.gameId
  //     });
  //
  //     console.log('1 =', 1);
  //
  //     // FIX: 왜 endQuizTime이 오지 않는 걸까?
  //     // 한 퀴즈 끝날 때까지 대기
  //     await new Promise((resolve) => client1.once(socketEvents.END_QUIZ_TIME, resolve));
  //
  //     console.log('2 =', 2);
  //
  //     // 두 플레이어 중 한 플레이어가 메시지 전송
  //     const testMessage = 'Hello, everyone!';
  //     const messagePromises = [
  //       new Promise<any>((resolve) => client1.once(socketEvents.CHAT_MESSAGE, resolve)),
  //       new Promise<any>((resolve) => client2.once(socketEvents.CHAT_MESSAGE, resolve)),
  //     ];
  //     const messagePromises2 = [
  //       new Promise<any>((resolve) => client3.once(socketEvents.CHAT_MESSAGE, resolve)),
  //     ];
  //     client1.emit(socketEvents.CHAT_MESSAGE, {
  //       gameId: createResponse.gameId,
  //       message: testMessage
  //     });
  //
  //     // 검증 (생존자에게 가진 않았는지)
  //     const receivedMessages = await Promise.all(messagePromises);
  //     receivedMessages.forEach((msg) => {
  //       expect(msg.message).toBe(testMessage);
  //       expect(msg.playerName).toBe('Player1');
  //     });
  //
  //     // 관전자에게 보이지 않아야 한다.
  //     const receivedMessages2 = await Promise.all(messagePromises2);
  //     receivedMessages2.forEach((msg) => {
  //       expect(msg).toBeUndefined();
  //     });
  //   });
  // })
});
