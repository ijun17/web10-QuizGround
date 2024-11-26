import { SocketMock } from '../SocketMock';

export default class SocketMockNextQuiz extends SocketMock {
  constructor() {
    super();
    this.addPlayers(
      Array(10)
        .fill(null)
        .map((_, i) => ({
          playerId: String(i + 1),
          playerName: 'player' + i,
          playerPosition: [i / 10, i / 10]
        }))
    );
    this.test();
  }

  async test() {
    //2초후 게임 시작
    await this.delay(2);
    this.log('게임이 시작되었습니다.');
    this.emitServer('startGame', {});
    //퀴즈 전송
    await this.progressQuiz('1+1=?', 3, ['1', '2', '3'], 1);
    this.log('첫번째 퀴즈가 종료되었습니다.');
    await this.delay(4);
    this.log('두번째 퀴즈가 시작되었습니다.');
    await this.progressQuiz('2+2=?', 3, ['1', '2', '4'], 2);
    this.log('테스트가 종료되었습니다.');
  }
}
