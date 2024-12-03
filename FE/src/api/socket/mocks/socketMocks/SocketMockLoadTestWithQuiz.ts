import { SocketMock } from '../SocketMock';

export default class SocketMockLoadTestWithQuiz extends SocketMock {
  constructor() {
    super();
    this.createDummyPlayer(100);
    this.performenceTest([this.chatRandom(10, 1), this.moveRandom(10, 1), this.testQuiz()]);
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
