import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { WsExceptionFilter } from '../common/filters/ws-exception.filter';
import socketEvents from '../common/constants/socket-events';
import { CreateGameDto } from './dto/create-game.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { GameService } from './game.service';
import { UpdatePositionDto } from './dto/update-position.dto';
import { GameValidationPipe } from './validations/game-validation.pipe';
import { StartGameDto } from './dto/start-game.dto';

@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: '*'
  },
  namespace: '/game'
})
export class GameGateway {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('GameGateway');

  constructor(
    private readonly gameService: GameService
  ) {}

  @SubscribeMessage(socketEvents.CREATE_ROOM)
  @UsePipes(new GameValidationPipe(socketEvents.CREATE_ROOM))
  async handleCreateRoom(
    @MessageBody() gameConfig: CreateGameDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const roomId = await this.gameService.createRoom(gameConfig, client.id);
    client.emit(socketEvents.CREATE_ROOM, { gameId: roomId });
  }

  @SubscribeMessage(socketEvents.JOIN_ROOM)
  @UsePipes(new GameValidationPipe(socketEvents.JOIN_ROOM))
  async handleJoinRoom(
    @MessageBody() dto: JoinRoomDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const { players, newPlayer } = await this.gameService.joinRoom(dto, client.id);

    client.join(dto.gameId);
    client.emit(socketEvents.JOIN_ROOM, { players });
    this.server.to(dto.gameId).emit(socketEvents.JOIN_ROOM, {
      players: [newPlayer]
    });
  }

  @SubscribeMessage(socketEvents.UPDATE_POSITION)
  @UsePipes(new GameValidationPipe(socketEvents.UPDATE_POSITION))
  async handleUpdatePosition(
    @MessageBody() updatePosition: UpdatePositionDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const result = await this.gameService.updatePosition(updatePosition, client.id);
    this.server.to(updatePosition.gameId).emit(socketEvents.UPDATE_POSITION, result);
  }

  @SubscribeMessage(socketEvents.CHAT_MESSAGE)
  @UsePipes(new GameValidationPipe(socketEvents.CHAT_MESSAGE))
  async handleChatMessage(
    @MessageBody() chatMessage: ChatMessageDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const result = await this.gameService.handleChatMessage(chatMessage, client.id);
    this.server.to(chatMessage.gameId).emit(socketEvents.CHAT_MESSAGE, result);
  }

  // TODO: Redis에 맞게 구현해야 함. (아직 초안이라 해서, redis로 바로 수정하지 않았음)
  // @SubscribeMessage(socketEvents.START_GAME)
  // handleStartGame(
  //   @MessageBody() startGameDto: StartGameDto,
  //   @ConnectedSocket() client: Socket
  // ): void {
  //   const { gameId } = startGameDto;
  //   const room = this.rooms.get(gameId);
  //   if (room.host !== client.id) {
  //     client.emit('error', '[ERROR] 방장만 게임을 시작할 수 있습니다.');
  //     return;
  //   }
  //   room.status = 'playing';
  //   this.server.to(gameId).emit(socketEvents.START_GAME, 'gameStarted');
  //   this.logger.verbose(`게임 시작: ${gameId}`);
  // }
  //
  // @SubscribeMessage(socketEvents.START_QUIZ_TIME)
  // handleStartQuizTime(
  //   @MessageBody() startGameDto: StartGameDto,
  //   @ConnectedSocket() client: Socket
  // ): void {
  //   const { gameId } = startGameDto;
  //   const room = this.rooms.get(gameId);
  //   if (room.host !== client.id) {
  //     client.emit('error', '[ERROR] 방장만 퀴즈를 시작할 수 있습니다.');
  //     return;
  //   }
  //   if (room.status !== 'playing') {
  //     client.emit('error', '[ERROR] 게임이 시작되지 않았습니다.');
  //     return;
  //   }
  //   this.server.to(gameId).emit(socketEvents.START_QUIZ_TIME, 'gameStarted');
  //   this.logger.verbose(`퀴즈 시간 시작: ${gameId}`);
  // }

  // TODO: Redis에 맞게 구현해야 함. (아직 완전히 작성된 함수가 아니라, redis로 바로 수정하지 않았음)
  // async handleDisconnect(client: Socket) {
  //   this.logger.verbose(`클라이언트가 연결 해제되었어요!: ${client.id}`);
  //   this.rooms.forEach((room, roomId) => {
  //     room.players.delete(client.id);
  //     if (room.players.has(client.id)) {
  //       const player = room.players.get(client.id);
  //       room.players.delete(client.id);
  //       if (player.isHost && room.players.size > 0) {
  //         const newHostId = room.players.keys()[0];
  //         const newHost = room.players.get(newHostId);
  //         newHost.isHost = true;
  //         room.host = newHostId;
  //         // TODO: 호스트 변경 클라이언트에게 보내주기
  //       }
  //       this.server.to(room.id).emit(socketEvents.EXIT_ROOM, { playerId: client.id });
  //     }
  //     if (room.players.size === 0) {
  //       this.rooms.delete(roomId); // TODO: delete는 성능이 좋지 않음. 우선 임시로 사용하고 향후 Redis로 개선
  //     }
  //   });
  //
  //   // TODO: 세션만 삭제하는 게 아니라 소켓도 삭제하기
  // }

  afterInit() {
    this.logger.verbose('WebSocket 서버 초기화 완료했어요!');
  }

  handleConnection(client: Socket) {
    this.logger.verbose(`클라이언트가 연결되었어요!: ${client.id}`);
  }
}
