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
  }
}
