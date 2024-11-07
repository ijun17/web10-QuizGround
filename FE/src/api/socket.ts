import { io, Socket } from 'socket.io-client';
import SocketEvents from '../constants/socketEvents';
import { SocketDataMap } from './socketEventTypes';

type SocketEvent = keyof SocketDataMap;

class SocketService {
  private socket: Socket;
  private url: string;
  private handlers: (() => void)[];

  constructor(url: string) {
    this.socket = io();
    this.url = url;
    this.handlers = [];
  }

  async connect() {
    if (this.isActive()) return;
    this.socket = io(this.url);
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

  disconnect() {
    this.socket.disconnect();
  }

  isActive() {
    return this.socket && this.socket.connected;
  }

  getSocketId() {
    return this.socket.id;
  }

  on<T extends SocketEvent>(event: T, callback: (data: SocketDataMap[T]['response']) => void) {
    const handler = () => this.socket.on(event as string, callback);
    this.handlers.push(handler);
    if (this.isActive()) handler();
  }

  emit<T extends SocketEvent>(event: T, data: SocketDataMap[T]['request']) {
    this.socket.emit(event, data);
  }

  sendChatMessage(message: SocketDataMap[typeof SocketEvents.CHAT_MESSAGE]['request']) {
    this.emit(SocketEvents.CHAT_MESSAGE, message);
  }

  async createRoom(payload: SocketDataMap['createRoom']['request']) {
    await this.connect();
    this.socket.emit(SocketEvents.CREATE_ROOM, payload);
  }

  async joinRoom(gameId: string, playerName: string) {
    if (!this.isActive()) await this.connect();
    this.socket.emit(SocketEvents.JOIN_ROOM, { gameId, playerName });
  }

  chatMessage(gameId: string, message: string) {
    this.socket.emit(SocketEvents.CHAT_MESSAGE, { gameId, message });
  }
}

export const socketService = new SocketService('http://' + window.location.hostname + ':3000/game');
