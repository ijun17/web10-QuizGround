import { SocketMock } from '../SocketMock';

export default class SocketMockStartGame extends SocketMock {
  constructor() {
    super('');
    this.players = Array(10)
      .fill(null)
      .map((_, i) => ({
        playerId: String(i + 1),
        playerName: 'player' + i,
        playerPosition: [i / 10, i / 10]
      }));
    this.test();
  }

  async test() {
    //2초후 게임 시작
    await this.delay(2);
    this.log('게임이 시작되었습니다.');
    this.emitServer('startGame', {});
    //퀴즈 전송
    await this.delay(2);
    this.setQuiz('1+0+0은?', 5, ['1', '2', '3', '4']);
    this.log('퀴즈 전송 완료.');

    // 퀴즈 종료
    await this.delay(8);
    this.calculateScore(1);
    this.log('퀴즈 가 종료 되었습니다.');
  }
}
