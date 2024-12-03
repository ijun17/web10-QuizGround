import { SocketMock } from '../SocketMock';

export default class SocketMockHost extends SocketMock {
  constructor() {
    super();
    this.createDummyPlayer(10);
    this.test();
  }

  async test() {
    await this.delay(1);
    this.emitServer('updateHost', { hostId: this.id });
    this.emitServer('updateRoomOption', {
      title: '즐거운 퀴즈 시간~~~~~~',
      gameMode: 'SURVIVAL',
      maxPlayerCount: 200,
      isPublic: true
    });
  }
}
