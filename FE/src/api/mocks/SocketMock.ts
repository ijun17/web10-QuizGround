import SocketEvents from '@/constants/socketEvents';
import { SocketDataMap } from '../socketEventTypes';

type SocketEvent = keyof SocketDataMap;

export class SocketMock {
  private listenerSet: Record<string, ((...args: unknown[]) => void)[]> = {};
  private onAnyListenerList: ((event: string, ...args: unknown[]) => void)[] = [];
  constructor() {
    console.log(`Mock WebSocket 연결`);
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
  private async handleJoin(data: SocketDataMap[typeof SocketEvents.JOIN_ROOM]['request']) {
    if (this.getPlayer(this.id)) return;
    await this.delay(0.1);
    const currentPlayer: (typeof this.players)[string] = {
      playerId: this.id,
      playerName: data.playerName,
      playerPosition: [0.5, 0.5]
    };
    this.emitServer(SocketEvents.JOIN_ROOM, { players: this.getPlayerList() });
    this.emitServer(SocketEvents.JOIN_ROOM, { players: [currentPlayer] });
    this.addPlayers([currentPlayer]);
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
   * chatMessage
   */
  getPlayer(id: string) {
    return this.players[id];
  }
  getPlayerList() {
    return Object.values(this.players);
  }
  addPlayers(players: Array<SocketMock['players'][keyof SocketMock['players']]>) {
    players.forEach((p) => (this.players[p.playerId] = p));
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
}
