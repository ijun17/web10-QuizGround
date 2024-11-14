import { SocketMock } from '../SocketMock';

export default class SocketMockLoadTest extends SocketMock {
  constructor() {
    super('');
    this.players = Array(100)
      .fill(null)
      .map((_, i) => ({
        playerId: String(i + 1),
        playerName: 'player' + i,
        playerPosition: [this.random(), this.random()]
      }));
    this.testChat();
    this.testMove();
  }
  // 10명의 유저가 채팅을 보냄
  async testChat() {
    const playerCount = this.players.length;
    const testTime = 10;
    for (let j = 0; j < testTime; j++) {
      //10초동안
      for (let i = 0; i < playerCount; i++) {
        await this.delay(1 / playerCount);
        this.emitServer('chatMessage', {
          playerId: this.players[i].playerId,
          playerName: this.players[i].playerName,
          message: 'message' + i,
          timestamp: 0
        });
      }
    }
  }

  async testMove() {
    const playerCount = this.players.length;
    const testTime = 10;
    for (let j = 0; j < testTime; j++) {
      //10초동안
      for (let i = 0; i < playerCount; i++) {
        await this.delay(1 / playerCount);
        this.emitServer('updatePosition', {
          playerId: this.players[i].playerId,
          playerPosition: [this.random(), this.random()]
        });
      }
    }
  }
}
