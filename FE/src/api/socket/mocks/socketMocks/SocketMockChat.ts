import { SocketMock } from '../SocketMock';

export default class SocketMockChat extends SocketMock {
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
    this.testChat();
  }
  // 10명의 유저가 채팅을 보냄
  async testChat() {
    const playerCount = this.getPlayerList().length;
    const testTime = 5;
    for (let j = 0; j < testTime; j++) {
      for (const player of this.getPlayerList()) {
        await this.delay(1 / playerCount);
        this.chatMessage(player.playerId, 'message' + player.playerId);
      }
    }
  }
}
