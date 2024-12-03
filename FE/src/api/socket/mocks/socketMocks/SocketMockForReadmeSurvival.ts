import { getRandomNickname } from '@/features/game/utils/nickname';
import { SocketMock } from '../SocketMock';

const chatMessages = [
  '안녕하세요?',
  '이 문제 뭐지?',
  '점심 먹었어?',
  '뭐 하고 있어?',
  '오늘 날씨 좋다!',
  '잠깐 시간 돼?',
  '여기 봐봐!',
  '도움이 필요해.',
  '언제 만날까?',
  '진짜야?',
  '좋은 하루 보내!',
  '이거 어때?',
  '잘 모르겠어.',
  '대박!',
  '좀 더 설명해줘.',
  '같이 할래?',
  '괜찮아?',
  '나중에 이야기하자.',
  '너무 웃겨!',
  '고마워!'
];

export default class SocketMockForReadmeSurvival extends SocketMock {
  constructor() {
    super();
    this.test();

    this.moveRandom(15, 0.5);
    this.testChat();
  }

  async test() {
    await this.initialrized;
    const playerCount = Object.keys(this.players).length;
    this.addPlayers(
      Array(35)
        .fill(null)
        .map((_, i) => ({
          playerId: String(playerCount + i + 1),
          playerName: getRandomNickname(),
          playerPosition: [this.random(), this.random()],
          isHost: false
        }))
    );

    this.emitServer('updateRoomOption', {
      title: '즐거운 퀴즈 시간~~',
      gameMode: 'SURVIVAL',
      maxPlayerCount: 200,
      isPublic: true
    });

    //2초후 게임 시작
    await this.delay(2);
    this.emitServer('startGame', {});

    //퀴즈 전송
    await this.progressQuiz(
      '우리 팀의 이름은?',
      5,
      ['시크릿주주', '시크릿추추', '시크릿쥬쥬', '시크릿츄츄'],
      0
    );
    await this.delay(3);
    await this.progressQuiz(
      '이 서비스의 이름은?',
      5,
      ['퀴즈 그라운드', '배틀 그라운드', '큐플레이', '카훗'],
      0
    );
    await this.delay(3);
    await this.progressQuiz('네이버 부스트캠프는 국내 최고의 부트캠트다', 5, ['O', 'X'], 0);

    // 퀴즈 종료
    await this.delay(5);
    this.emitServer('endGame', { hostId: this.id });
  }

  async testChat() {
    await this.initialrized;
    const playerCount = this.getPlayerList().length;
    for (let j = 0; j < 20; j++) {
      for (const player of this.getPlayerList()) {
        if (player.playerId === this.id) continue;
        await this.delay(1 / playerCount / 0.1);
        this.chatMessage(
          player.playerId,
          chatMessages[Math.floor(Math.random() * chatMessages.length)]
        );
      }
    }
  }
}
