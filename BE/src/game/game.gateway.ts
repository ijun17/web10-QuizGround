import { SubscribeMessage, WebSocketGateway, WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { v4 as uuidv4 } from 'uuid';

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: '*', // TODO: 실제 서비스에서는 특정 도메인만 허용해야 함
  },
})
export class GameGateway {
  @WebSocketServer()
  server: Server;

  private rooms: Map<string, Set<string>> = new Map(); // TODO: 좀 더 확장성 있는 구조로 변경 or Redis 사용

  @SubscribeMessage('createGame')
  handleCreateRoom(client: Socket): string {
    const roomId = uuidv4();

    client.join(roomId);
    const newGame: Set<string> = new Set();
    newGame.add(client.id);
    this.rooms.set(roomId, newGame);

    return roomId;
  }

  // TODO: 게임방 최대 인원 제한 로직 추가
  @SubscribeMessage('joinGame')
  handleJoinRoom(client: Socket, roomId: string): void {
    if (!this.rooms.has(roomId)) {
      client.emit('error', '[ERROR] 존재하지 않는 게임 방입니다.');
      return;
    }
    this.rooms.get(roomId).add(client.id);
  }

  afterInit() {
    console.log('WebSocket 서버 초기화 완료했어요!'); // TODO: console보다는 로거 사용하는 게 나을 듯
  }

  handleConnection(client: Socket) {
    console.log(`클라이언트가 연결되었어요!: ${client.id}`); // TODO: console보다는 로거 사용하는 게 나을 듯
  }

  handleDisconnect(client: Socket) {
    console.log(`클라이언트가 연결 해제되었어요!: ${client.id}`); // TODO: console보다는 로거 사용하는 게 나을 듯
    this.rooms.forEach((clients, room) => {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.rooms.delete(room);
      }
    });
  }
}