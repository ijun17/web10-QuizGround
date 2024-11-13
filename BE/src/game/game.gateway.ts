import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UsePipes } from '@nestjs/common';
import { WsExceptionFilter } from '../common/filters/ws-exception.filter';
import SocketEvents from '../common/constants/socket-events';
import { CreateGameDto } from './dto/create-game.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { GameService } from './game.service';
import { UpdatePositionDto } from './dto/update-position.dto';
import { GameValidationPipe } from './validations/game-validation.pipe';
import { StartGameDto } from './dto/start-game.dto';
import { UpdateRoomOptionDto } from './dto/update-room-option.dto';
import { UpdateRoomQuizsetDto } from './dto/update-room-quizset.dto';

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

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage(SocketEvents.CREATE_ROOM)
  @UsePipes(new GameValidationPipe(SocketEvents.CREATE_ROOM))
  async handleCreateRoom(
    @MessageBody() gameConfig: CreateGameDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const roomId = await this.gameService.createRoom(gameConfig, client.id);
    client.emit(SocketEvents.CREATE_ROOM, { gameId: roomId });
  }

  @SubscribeMessage(SocketEvents.JOIN_ROOM)
  @UsePipes(new GameValidationPipe(SocketEvents.JOIN_ROOM))
  async handleJoinRoom(
    @MessageBody() dto: JoinRoomDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const players = await this.gameService.joinRoom(dto, client.id);

    client.join(dto.gameId);
    client.emit(SocketEvents.JOIN_ROOM, { players });
  }

  @SubscribeMessage(SocketEvents.UPDATE_POSITION)
  @UsePipes(new GameValidationPipe(SocketEvents.UPDATE_POSITION))
  async handleUpdatePosition(
    @MessageBody() updatePosition: UpdatePositionDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    await this.gameService.updatePosition(updatePosition, client.id);
  }

  @SubscribeMessage(SocketEvents.CHAT_MESSAGE)
  @UsePipes(new GameValidationPipe(SocketEvents.CHAT_MESSAGE))
  async handleChatMessage(
    @MessageBody() chatMessage: ChatMessageDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const result = await this.gameService.handleChatMessage(chatMessage, client.id);
    this.server.to(chatMessage.gameId).emit(SocketEvents.CHAT_MESSAGE, result);
  }

  @SubscribeMessage(SocketEvents.UPDATE_ROOM_OPTION)
  @UsePipes(new GameValidationPipe(SocketEvents.UPDATE_ROOM_OPTION))
  async handleUpdateRoomOption(
    @MessageBody() updateRoomOptionDto: UpdateRoomOptionDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.gameService.updateRoomOption(updateRoomOptionDto, client.id);
  }

  @SubscribeMessage(SocketEvents.UPDATE_ROOM_QUIZSET)
  @UsePipes(new GameValidationPipe(SocketEvents.UPDATE_ROOM_QUIZSET))
  async handleUpdateRoomQuizset(
    @MessageBody() updateRoomQuizsetDto: UpdateRoomQuizsetDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.gameService.updateRoomQuizset(updateRoomQuizsetDto, client.id);
  }

  @SubscribeMessage(SocketEvents.START_GAME)
  @UsePipes(new GameValidationPipe(SocketEvents.START_GAME))
  async handleStartGame(
    @MessageBody() startGameDto: StartGameDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.gameService.startGame(startGameDto, client.id);
  }

  afterInit() {
    this.logger.verbose('WebSocket 서버 초기화 완료했어요!');

    this.gameService.subscribeRedisEvent(this.server).then(() => {
      this.logger.verbose('Redis 이벤트 등록 완료했어요!');
    });
  }

  handleConnection(client: Socket) {
    this.logger.verbose(`클라이언트가 연결되었어요!: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.verbose(`클라이언트가 연결 해제되었어요!: ${client.id}`);

    this.gameService.disconnect(client.id);
  }
}
