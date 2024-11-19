import SocketEvents from '@/constants/socketEvents';
import { SocketDataMap } from '../socketEventTypes';

type SocketEvent = keyof SocketDataMap;

export class SocketMock {
  private listenerSet: Record<string, ((...args: unknown[]) => void)[]> = {};
  private onAnyListenerList: ((event: string, ...args: unknown[]) => void)[] = [];
  constructor(url: string) {
    console.log(`Mock WebSocket 연결: ${url}`);
  }
  id = 'memememememe';
  connected = true;
  on(event: string, listener: (...args: unknown[]) => void) {
    if (!this.listenerSet[event]) this.listenerSet[event] = [];
    this.listenerSet[event].push(listener);
  }
  onAny(listener: (...args: unknown[]) => void) {
    this.onAnyListenerList.push(listener);
  }
  emit<T extends SocketEvent>(event: T, data: SocketDataMap[T]['request']) {
    //여기서 서버에 데이터 전송
    switch (event) {
      case SocketEvents.CHAT_MESSAGE:
        return this.handleChat(data as SocketDataMap[typeof SocketEvents.CHAT_MESSAGE]['request']);
      case SocketEvents.JOIN_ROOM:
        return this.handleJoin(data as SocketDataMap[typeof SocketEvents.JOIN_ROOM]['request']);
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

  //여기서 서버 이벤트를 실행시킨다.
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
  //시드 기반 랜덤 함수
  SEED = 7777;
  random() {
    this.SEED = (this.SEED * 16807) % 2147483647;
    return (this.SEED - 1) / 2147483646;
  }

  isCurrentJoin = false;
  currentPlayerName = '';
  players: {
    playerId: string;
    playerName: string;
    playerPosition: [number, number];
  }[] = [];

  quiz: {
    quiz: string;
    endTime: number;
    startTime: number;
    choiceList: { content: string; order: number }[];
  } | null = null;

  // 아래는 서버 비즈니스 로직
  private async handleChat(data: SocketDataMap['chatMessage']['request']) {
    await this.delay(0.1);
    this.emitServer('chatMessage', {
      playerId: this.id,
      playerName: this.currentPlayerName,
      message: data.message,
      timestamp: 0
    });
  }
  private async handleJoin(data: SocketDataMap[typeof SocketEvents.JOIN_ROOM]['request']) {
    if (this.isCurrentJoin) return;
    this.isCurrentJoin = true;
    await this.delay(0.1);
    this.currentPlayerName = data.playerName;
    const currentPlayer: (typeof this.players)[number] = {
      playerId: this.id,
      playerName: data.playerName,
      playerPosition: [0.5, 0.5]
    };
    this.emitServer(SocketEvents.JOIN_ROOM, {
      players: this.players
    });
    this.emitServer(SocketEvents.JOIN_ROOM, {
      players: [currentPlayer]
    });
    this.players.push(currentPlayer);
  }
  private async handlePosition(
    data: SocketDataMap[typeof SocketEvents.UPDATE_POSITION]['request']
  ) {
    await this.delay(0.1);
    const targetPlayer = this.players.find((p) => p.playerId === this.id);
    if (targetPlayer) targetPlayer.playerPosition = data.newPosition;
    this.emitServer(SocketEvents.UPDATE_POSITION, {
      playerId: this.id,
      playerPosition: data.newPosition
    });
  }
  private async handleOption(
    data: SocketDataMap[typeof SocketEvents.UPDATE_ROOM_OPTION]['request']
  ) {
    await this.delay(0.1);
    this.emitServer(SocketEvents.UPDATE_ROOM_OPTION, {
      title: data.title,
      gameMode: data.gameMode,
      maxPlayerCount: data.maxPlayerCount,
      isPublic: data.isPublic
    });
  }
  private async handleQuiz(
    data: SocketDataMap[typeof SocketEvents.UPDATE_ROOM_QUIZSET]['request']
  ) {
    await this.delay(0.1);
    this.emitServer(SocketEvents.UPDATE_ROOM_QUIZSET, data);
  }

  //퀴즈 관련 비즈니스 로직
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
    const players = this.players.map((p) => {
      const [y, x] = p.playerPosition;
      const option =
        Math.round(x) + Math.floor(y * Math.ceil((this.quiz?.choiceList.length || 0) / 2)) * 2 + 1;
      return {
        playerId: p.playerId,
        isAnswer: option === answer,
        score: option === answer ? 22 : 0
      };
    });
    const payload = { answer, players };
    this.emitServer('endQuizTime', payload);
  }

  async progressQuiz(quiz: string, quizSecond: number, choiceList: string[], answer: number) {
    this.setQuiz(quiz, quizSecond, choiceList);
    await this.delay(3 + quizSecond);
    this.calculateScore(answer);
  }
}
