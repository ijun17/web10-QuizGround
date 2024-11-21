import { SocketMock } from '../SocketMock';

export default class SocketMockLoadTest extends SocketMock {
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
}
