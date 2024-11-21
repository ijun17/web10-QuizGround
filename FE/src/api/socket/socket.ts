import { io } from 'socket.io-client';
import SocketEvents from '@/constants/socketEvents';
import { SocketDataMap } from './socketEventTypes';
import mockMap from './mocks/socketMocks';

type SocketEvent = keyof SocketDataMap;

type SocketInterface = {
  connected: boolean;
  id: string;

  emit: <T extends SocketEvent>(event: T, data: SocketDataMap[T]['request']) => void;

  on: <T extends SocketEvent>(
    event: string,
    callback: (data: SocketDataMap[T]['response']) => void
  ) => void;

  off: <T extends SocketEvent>(
    event: string,
    callback: (data: SocketDataMap[T]['response']) => void
  ) => void;

  onAny: <T extends SocketEvent>(
    callback: (event: T, data: SocketDataMap[T]['response']) => void
  ) => void;

  disconnect: () => void;
};

class SocketService {
  private socket: SocketInterface;
  private url: string;
  private handlers: (() => void)[];

  constructor(url: string) {
    this.socket = io() as SocketInterface;
    this.url = url;
    this.handlers = [];
  }

  async connect() {
    if (this.isActive()) return;
    this.socket = io(this.url) as SocketInterface;
    await new Promise<void>((resolve, reject) => {
      this.socket.on('connect', () => resolve());
      this.socket.on('error', () => reject());
    });
    this.handlers.forEach((h) => h());
    this.socket.onAny((eventName, ...args) => {
      console.log(`SOCKET[${eventName}]`, ...args);
    });
    return;
  }

  async connectMock(gameId: keyof typeof mockMap) {
    if (this.isActive()) return;
    this.socket = new mockMap[gameId]() as SocketInterface;
    this.handlers.forEach((h) => h());
    this.socket.onAny((eventName, ...args) => {
      console.log(`SOCKET[${eventName}]`, ...args);
    });
  }

  disconnect() {
    this.socket.disconnect();
  }

  isActive() {
    return this.socket && this.socket.connected;
  }

  getSocketId() {
    return this.socket.id;
  }

  onPermanently<T extends SocketEvent>(
    event: T,
    callback: (data: SocketDataMap[T]['response']) => void
  ) {
    const handler = () => this.socket.on(event, callback);
    this.handlers.push(handler);
    if (this.isActive()) handler();
  }

  on<T extends SocketEvent>(event: T, callback: (data: SocketDataMap[T]['response']) => void) {
    if (this.isActive()) this.socket.on(event, callback);
  }

  off<T extends SocketEvent>(event: T, callback: (data: SocketDataMap[T]['response']) => void) {
    if (this.isActive()) this.socket.off(event, callback);
  }

  emit<T extends SocketEvent>(event: T, data: SocketDataMap[T]['request']) {
    this.socket.emit(event, data);
  }

  async createRoom(payload: SocketDataMap['createRoom']['request']) {
    await this.connect();
    this.socket.emit(SocketEvents.CREATE_ROOM, payload);
  }

  async joinRoom(gameId: string, playerName: string) {
    if (gameId in mockMap) this.connectMock(gameId as keyof typeof mockMap);
    else if (!this.isActive()) await this.connect();
    this.socket.emit(SocketEvents.JOIN_ROOM, { gameId, playerName });
  }

  chatMessage(gameId: string, message: string) {
    this.socket.emit(SocketEvents.CHAT_MESSAGE, { gameId, message });
  }
}

export const socketService = new SocketService('http://' + window.location.hostname + ':3000/game');
