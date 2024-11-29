import { SocketMock } from '../SocketMock';

export default class SocketMockLoadTest extends SocketMock {
  constructor() {
    super();
    this.createDummyPlayer(100);
    this.performenceTest([this.chatRandom(5, 1), this.moveRandom(5, 1)]);
  }
}
