import { io, Socket } from 'socket.io-client';
import SocketEvents from '../constants/socketEvents';

type SocketEvent = (typeof SocketEvents)[keyof typeof SocketEvents];

interface ChatMessage {
  userId: string;
  message: string;
}

interface CreateRoomPayload {
  roomName: string;
  maxPlayers: number;
  gameMode: string;
  isPublic: boolean;
}

// 이벤트의 데이터 타입을 정의
interface SocketDataMap {
  chatMessage: ChatMessage;
  createRoom: CreateRoomPayload;
  // 다른 이벤트의 데이터 타입을 추가
}

class SocketService {
  private socket: Socket;
  private url: string;

  constructor(url: string) {
    this.socket = io();
    this.url = url;
  }

  connect() {
    this.socket = io(this.url);
    return new Promise((resolve, reject) => {
      this.socket.on('connect', () => resolve);
      this.socket.on('error', () => reject);
    });
  }

  isActive() {
    return this.socket && this.socket.active;
  }

  // 이벤트 수신 메서드
  on<T extends SocketEvent>(event: T, callback: (data: SocketDataMap[T]) => void) {
    this.socket.on(event, (data: SocketDataMap[T]) => {
      callback(data);
    });
  }

  // 메시지 전송 메서드
  sendChatMessage(message: ChatMessage) {
    this.socket.emit(SocketEvents.CHAT_MESSAGE, message);
  }

  // 방 생성 메서드
  async createRoom(payload: CreateRoomPayload) {
    await this.connect();
    this.socket.emit(SocketEvents.CREATE_ROOM, payload);
  }

  // 연결 종료 메서드
  disconnect() {
    this.socket.disconnect();
  }
}

export const socketService = new SocketService('');
