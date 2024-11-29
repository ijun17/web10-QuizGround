import { SocketMock } from '../SocketMock';

export default class SocketMockLoadTestOnlyMove extends SocketMock {
  constructor() {
    super();
    this.createDummyPlayer(200);
    this.performenceTest([this.moveRandom(5, 1)]);
  }
}
