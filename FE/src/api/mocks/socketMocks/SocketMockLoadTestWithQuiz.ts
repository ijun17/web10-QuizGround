import { SocketMock } from '../SocketMock';

export default class SocketMockLoadTestWithQuiz extends SocketMock {
  constructor() {
    super();
    this.addPlayers(
      Array(100)
        .fill(null)
        .map((_, i) => ({
          playerId: String(i + 1),
          playerName: 'player' + i,
          playerPosition: [i / 10, i / 10]
        }))
    );
    this.testChat();
    this.testMove();
    this.testQuiz();
  }

  async testChat() {
    const playerCount = this.getPlayerList().length;
    const testTime = 10;
    for (let j = 0; j < testTime; j++) {
      for (const player of this.getPlayerList()) {
        await this.delay(1 / playerCount);
        this.chatMessage(player.playerId, 'message' + player.playerId);
      }
    }
  }

  async testMove() {
    const playerCount = this.getPlayerList().length;
    const testTime = 10;
    for (let j = 0; j < testTime; j++) {
      for (const player of this.getPlayerList()) {
        await this.delay(1 / playerCount);
        this.updatePlayerPosition(player.playerId, [this.random(), this.random()]);
      }
    }
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

    // 퀴즈 종료
    await this.delay(5);
    this.log('게임이 종료되었습니다.');
    this.emitServer('endGame', { hostId: this.id });
  }
}
