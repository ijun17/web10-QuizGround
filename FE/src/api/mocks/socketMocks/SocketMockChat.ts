import { SocketMock } from '../SocketMock';

export default class SocketMockChat extends SocketMock {
  constructor() {
    super('');
    this.players = Array(10)
      .fill(null)
      .map((_, i) => ({
        playerId: String(i + 1),
        playerName: 'player' + i,
        playerPosition: [i / 10, i / 10]
      }));
    this.test1();
  }
  // 10명의 유저가 채팅을 보냄
  async test1() {
    for (let i = 0; i < 10; i++) {
      await this.delay(1);
      console.log(i);
      this.emitServer('chatMessage', {
        playerId: this.players[i].playerId,
        playerName: this.players[i].playerName,
        message: String(i),
        timestamp: 0
      });
    }
  }
}
