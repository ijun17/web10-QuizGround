import SocketEvents from '@/constants/socketEvents';
import { SocketDataMap } from '../socketEventTypes';

type SocketEvent = keyof SocketDataMap;

export class SocketMock {
  private listenerSet: Record<string, ((...args: unknown[]) => void)[]> = {};
  private onAnyListenerList: ((event: string, ...args: unknown[]) => void)[] = [];
  initialrized: Promise<void>;
  constructor() {
    console.log(`%c Mock WebSocket 연결`, 'color:yellow; font-weight:bold;');
    this.initialrized = new Promise((resolve) => {
      this.delay(0).then(() => {
        resolve();
      });
    });
    this.initialrized.then(() => {
      const currentPlayer = {
        playerId: this.id,
        playerName: 'Me',
        playerPosition: [0.5, 0.5] as [number, number]
      };
      this.emitServer('joinRoom', { players: [currentPlayer] });
      this.addPlayers([currentPlayer]);
      this.emitServer('getSelfId', { playerId: this.id });
      this.emitServer('setPlayerName', { playerId: this.id, playerName: 'Me' });
    });

    // }
  }

  /**
   * socket.io 인터페이스
   * id, connected, on, onAny, emit, disconnect
   */
  id = 'memememememe';
  connected = true;
  on(event: string, listener: (...args: unknown[]) => void) {
    if (!this.listenerSet[event]) this.listenerSet[event] = [];
    this.listenerSet[event].push(listener);
  }
  off(event: string, listener: (...args: unknown[]) => void) {
    if (!this.listenerSet[event]) this.listenerSet[event] = [];
    this.listenerSet[event] = this.listenerSet[event].filter((l) => l !== listener);
  }
  onAny(listener: (...args: unknown[]) => void) {
    this.onAnyListenerList.push(listener);
  }
  emit<T extends SocketEvent>(event: T, data: SocketDataMap[T]['request']) {
    console.log(`%c SERVER_SOCKET[${event}]`, 'background:blue; color:white', data);
    switch (event) {
      case SocketEvents.CHAT_MESSAGE:
        return this.handleChat(data as SocketDataMap[typeof SocketEvents.CHAT_MESSAGE]['request']);
      case SocketEvents.UPDATE_POSITION:
        return this.handlePosition(
          data as SocketDataMap[typeof SocketEvents.UPDATE_POSITION]['request']
        );
      case SocketEvents.UPDATE_ROOM_OPTION:
        return this.handleOption(
          data as SocketDataMap[typeof SocketEvents.UPDATE_ROOM_OPTION]['request']
        );
      case SocketEvents.UPDATE_ROOM_QUIZSET:
        return this.handleQuiz(
          data as SocketDataMap[typeof SocketEvents.UPDATE_ROOM_QUIZSET]['request']
        );
      default:
        return;
    }
  }
  disconnect() {
    this.connected = false;
  }

  /**
   * 유틸 함수
   * emitServer: 서버에서 이벤트를 발생 시킨다
   * delay: n초 지연시킨다
   * log: 채팅창에 로그를 띄운다
   * random: 시드 기반 랜덤 함수. 항상 동일한 결과를 보장
   */
  emitServer<T extends SocketEvent>(event: T, data: SocketDataMap[T]['response']) {
    if (this.listenerSet[event]) {
      this.listenerSet[event].forEach((e) => e(data));
    }
    this.onAnyListenerList.forEach((e) => e(event, data));
  }
  delay(second: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), second * 1000);
    });
  }
  log(message: string) {
    this.emitServer('chatMessage', {
      playerId: '',
      playerName: '[LOG]',
      message: message,
      timestamp: 0
    });
  }
  private SEED = 7777;
  random() {
    this.SEED = (this.SEED * 16807) % 2147483647;
    return (this.SEED - 1) / 2147483646;
  }

  /**
   * 서버 비즈니스 로직
   * players: 플레이어 맵(키: 플레이어 아이디, 값: 플레이어)
   * scores: 플레이어 점수 정보
   * quiz: 현재 진행중인 퀴즈
   * handleChat()
   * handleJoin()
   * handlePosition()
   * handleOption()
   * handleQuiz()
   */
  players: Record<
    string,
    {
      playerId: string;
      playerName: string;
      playerPosition: [number, number];
    }
  > = {};

  scores: Record<string, number> = {};

  quiz: {
    quiz: string;
    endTime: number;
    startTime: number;
    choiceList: { content: string; order: number }[];
  } | null = null;

  private async handleChat(data: SocketDataMap['chatMessage']['request']) {
    await this.delay(0.1);
    this.chatMessage(this.id, data.message);
  }
  private async handlePosition(
    data: SocketDataMap[typeof SocketEvents.UPDATE_POSITION]['request']
  ) {
    await this.delay(0.1);
    this.updatePlayerPosition(this.id, data.newPosition);
  }
  private async handleOption(
    data: SocketDataMap[typeof SocketEvents.UPDATE_ROOM_OPTION]['request']
  ) {
    await this.delay(0.1);
    this.emitServer(SocketEvents.UPDATE_ROOM_OPTION, data);
  }
  private async handleQuiz(
    data: SocketDataMap[typeof SocketEvents.UPDATE_ROOM_QUIZSET]['request']
  ) {
    await this.delay(0.1);
    this.emitServer(SocketEvents.UPDATE_ROOM_QUIZSET, data);
  }

  /**
   * 비즈니스 로직 관련 유틸 함수
   * getPlayer()
   * getPlayers()
   * addPlayers()
   * setQuiz()
   * calculate()
   * progressQuiz()
   * updatePlayerPosition()
   * chatMessage()
   * createDummyPlayer()
   * chatRandom()
   * moveRandom()
   */
  getPlayer(id: string) {
    return this.players[id];
  }
  getPlayerList() {
    return Object.values(this.players);
  }
  addPlayers(players: Array<SocketMock['players'][keyof SocketMock['players']]>) {
    players.forEach((p) => (this.players[p.playerId] = p));
    this.emitServer('joinRoom', { players });
  }
  setQuiz(quiz: string, quizSecond: number, choiceList: string[]) {
    const COUNT_DOWN_TIME = 3000;
    this.quiz = {
      quiz,
      startTime: Date.now() + COUNT_DOWN_TIME,
      endTime: Date.now() + COUNT_DOWN_TIME + quizSecond * 1000,
      choiceList: choiceList.map((e, i) => ({ content: e, order: i }))
    };
    this.emitServer('startQuizTime', this.quiz);
  }
  calculateScore(answer: number) {
    const players = this.getPlayerList().map((p) => {
      const [y, x] = p.playerPosition;
      const option =
        Math.round(x) + Math.floor(y * Math.ceil((this.quiz?.choiceList.length || 0) / 2)) * 2;
      this.scores[p.playerId] = (this.scores[p.playerId] | 0) + (option === answer ? 22 : 0);
      return {
        playerId: p.playerId,
        isAnswer: option === answer,
        score: this.scores[p.playerId]
      };
    });
    const payload = { answer, players };
    this.emitServer('endQuizTime', payload);
  }

  async progressQuiz(quiz: string, quizSecond: number, choiceList: string[], answerIndex: number) {
    this.setQuiz(quiz, quizSecond, choiceList);
    this.log('퀴즈 전송 완료.');
    await this.delay(3 + quizSecond);
    this.calculateScore(answerIndex);
    this.log('퀴즈가 종료 되었습니다.');
  }

  updatePlayerPosition(playerId: string, newPosition: [number, number]) {
    this.getPlayer(playerId).playerPosition = newPosition;
    this.emitServer('updatePosition', {
      playerId: this.getPlayer(playerId).playerId,
      playerPosition: newPosition
    });
  }

  chatMessage(playerId: string, message: string) {
    const player = this.getPlayer(playerId);
    this.emitServer('chatMessage', {
      playerId: player.playerId,
      playerName: player.playerName,
      message,
      timestamp: 0
    });
  }

  async createDummyPlayer(count: number) {
    await this.initialrized;
    const playerCount = Object.keys(this.players).length;
    this.addPlayers(
      Array(count)
        .fill(null)
        .map((_, i) => ({
          playerId: String(playerCount + i + 1),
          playerName: 'player' + (playerCount + i),
          playerPosition: [this.random(), this.random()]
        }))
    );
  }

  async chatRandom(testSec: number, chatPerSecPerPlyaer: number = 1) {
    await this.initialrized;
    const playerCount = this.getPlayerList().length;
    for (let j = 0; j < testSec; j++) {
      for (const player of this.getPlayerList()) {
        if (player.playerId === this.id) continue;
        await this.delay(1 / playerCount / chatPerSecPerPlyaer);
        this.chatMessage(player.playerId, 'message' + player.playerId);
      }
    }
  }

  async moveRandom(testSec: number, movePerSecPerPlyaer: number = 1) {
    await this.initialrized;
    const playerCount = this.getPlayerList().length;
    for (let j = 0; j < testSec; j++) {
      for (const player of this.getPlayerList()) {
        if (player.playerId === this.id) continue;
        await this.delay(1 / playerCount / movePerSecPerPlyaer);
        this.updatePlayerPosition(player.playerId, [this.random(), this.random()]);
      }
    }
  }

  async performenceTest(fnList: unknown[]) {
    const start = performance.now();
    Promise.all(fnList).then(() => {
      const end = performance.now();
      this.log(`PERFORMENCE: ${((end - start) / 1000).toFixed(2)}s`);
    });
  }
}
