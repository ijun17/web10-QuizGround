import { SocketMock } from '../SocketMock';

export default class SocketMockLoadTestWithQuiz extends SocketMock {
  constructor() {
    super('');
    this.players = Array(30)
      .fill(null)
      .map((_, i) => ({
        playerId: String(i + 1),
        playerName: 'player' + i,
        playerPosition: [this.random(), this.random()]
      }));
    this.testQuiz();
    // this.testChat();
    this.testMove();
  }

  async testQuiz() {
    //2초후 게임 시작
    await this.delay(2);
    this.log('게임이 시작되었습니다.');
    this.emitServer('startGame', {});
    //퀴즈 전송
    await this.progressQuiz('1+1=?', 5, ['1', '2', '3'], 1);
    this.log('첫번째 퀴즈가 종료되었습니다.');
    await this.delay(3);
    this.log('두번째 퀴즈가 시작되었습니다.');
    await this.progressQuiz('2+2=?', 5, ['1', '2', '4'], 2);
    this.log('테스트가 종료되었습니다.');
  }

  // 10명의 유저가 채팅을 보냄
  async testChat() {
    const playerCount = this.players.length;
    const testTime = 10;
    for (let j = 0; j < testTime; j++) {
      //10초동안
      for (let i = 0; i < playerCount; i++) {
        await this.delay(1 / playerCount);
        this.emitServer('chatMessage', {
          playerId: this.players[i].playerId,
          playerName: this.players[i].playerName,
          message: 'message' + i,
          timestamp: 0
        });
      }
    }
  }

  async testMove() {
    const playerCount = this.players.length;
    const testTime = 10;
    for (let j = 0; j < testTime; j++) {
      //10초동안
      for (let i = 0; i < playerCount; i++) {
        await this.delay(1 / playerCount);
        this.emitServer('updatePosition', {
          playerId: this.players[i].playerId,
          playerPosition: [this.random(), this.random()]
        });
      }
    }
  }
}
