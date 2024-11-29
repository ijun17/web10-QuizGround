import { SocketMock } from '../SocketMock';

export default class SocketMockChat extends SocketMock {
  constructor() {
    super();
    this.createDummyPlayer(10);

    this.performenceTest([this.chatRandom(5, 1)]);
  }
}
