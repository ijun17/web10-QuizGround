import { SocketMock } from '../SocketMock';

export default class SocketMockNextQuiz extends SocketMock {
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
    console.log('게임이 시작되었습니다.');
    this.emitServer('startGame', {});
    //퀴즈 전송
    await this.delay(2);
    this.setQuiz(
      '1+0+0은?',
      Date.now() + 5 * 1000,
      Array(3)
        .fill(null)
        .map((_, i) => ({ content: String(i + 1), order: i + 1 }))
    );
    console.log('퀴즈 전송 완료.');

    // 퀴즈 종료
    await this.delay(6);
    this.calculateScore(0);
    console.log('퀴즈 가 종료 되었습니다.');
  }
}
