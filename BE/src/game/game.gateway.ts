import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UseInterceptors, UsePipes } from '@nestjs/common';
import { WsExceptionFilter } from '../common/filters/ws-exception.filter';
import SocketEvents from '../common/constants/socket-events';
import { ChatMessageDto } from './dto/chat-message.dto';
import { GameService } from './service/game.service';
import { UpdatePositionDto } from './dto/update-position.dto';
import { GameValidationPipe } from './validations/game-validation.pipe';
import { StartGameDto } from './dto/start-game.dto';
import { UpdateRoomOptionDto } from './dto/update-room-option.dto';
import { UpdateRoomQuizsetDto } from './dto/update-room-quizset.dto';
import { GameChatService } from './service/game.chat.service';
import { GameRoomService } from './service/game.room.service';
import { GameActivityInterceptor } from './interceptor/gameActivity.interceptor';
import { parse, serialize } from 'cookie';
import { v4 as uuidv4 } from 'uuid';
import { SetPlayerNameDto } from './dto/set-player-name.dto';
import { KickRoomDto } from './dto/kick-room.dto';

@UseInterceptors(GameActivityInterceptor)
@UseFilters(new WsExceptionFilter())
@WebSocketGateway({
  cors: {
    origin: '*',
    credentials: true
  },
  namespace: '/game'
})
export class GameGateway {
  @WebSocketServer()
  server: Server;
  private logger = new Logger('GameGateway');

  constructor(
    private readonly gameService: GameService,
    private readonly gameChatService: GameChatService,
    private readonly gameRoomService: GameRoomService
  ) {}

  // @SubscribeMessage(SocketEvents.CREATE_ROOM)
  // @UsePipes(new GameValidationPipe(SocketEvents.CREATE_ROOM))
  // async handleCreateRoom(
  //   @MessageBody() gameConfig: CreateGameDto,
  //   @ConnectedSocket() client: Socket
  // ): Promise<void> {
  //   const roomId = await this.gameRoomService.createRoom(gameConfig, client.data.playerId);
  //   client.emit(SocketEvents.CREATE_ROOM, { gameId: roomId });
  // }

  // @SubscribeMessage(SocketEvents.JOIN_ROOM)
  // @UsePipes(new GameValidationPipe(SocketEvents.JOIN_ROOM))
  // @UseGuards(WsJwtAuthGuard)
  // async handleJoinRoom(
  //   @MessageBody() dto: JoinRoomDto,
  //   @ConnectedSocket() client: Socket
  // ): Promise<void> {
  //   if (client.data.user) {
  //     dto.playerName = client.data.user.nickname;
  //   }
  //   const players = await this.gameRoomService.joinRoom(client, dto, client.data.playerId);
  //   client.emit(SocketEvents.JOIN_ROOM, { players });
  // }

  @SubscribeMessage(SocketEvents.UPDATE_POSITION)
  @UsePipes(new GameValidationPipe(SocketEvents.UPDATE_POSITION))
  async handleUpdatePosition(
    @MessageBody() updatePosition: UpdatePositionDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    await this.gameService.updatePosition(updatePosition, client.data.playerId);
  }

  @SubscribeMessage(SocketEvents.CHAT_MESSAGE)
  @UsePipes(new GameValidationPipe(SocketEvents.CHAT_MESSAGE))
  async handleChatMessage(
    @MessageBody() chatMessage: ChatMessageDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    await this.gameChatService.chatMessage(chatMessage, client.data.playerId);
  }

  @SubscribeMessage(SocketEvents.UPDATE_ROOM_OPTION)
  @UsePipes(new GameValidationPipe(SocketEvents.UPDATE_ROOM_OPTION))
  async handleUpdateRoomOption(
    @MessageBody() updateRoomOptionDto: UpdateRoomOptionDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.gameRoomService.updateRoomOption(updateRoomOptionDto, client.data.playerId);
  }

  @SubscribeMessage(SocketEvents.UPDATE_ROOM_QUIZSET)
  @UsePipes(new GameValidationPipe(SocketEvents.UPDATE_ROOM_QUIZSET))
  async handleUpdateRoomQuizset(
    @MessageBody() updateRoomQuizsetDto: UpdateRoomQuizsetDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.gameRoomService.updateRoomQuizset(updateRoomQuizsetDto, client.data.playerId);
  }

  @SubscribeMessage(SocketEvents.START_GAME)
  @UsePipes(new GameValidationPipe(SocketEvents.START_GAME))
  async handleStartGame(
    @MessageBody() startGameDto: StartGameDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.gameService.startGame(startGameDto, client.data.playerId);
  }

  @SubscribeMessage(SocketEvents.SET_PLAYER_NAME)
  @UsePipes(new GameValidationPipe(SocketEvents.SET_PLAYER_NAME))
  async handleSetPlayerName(
    @MessageBody() setPlayerNameDto: SetPlayerNameDto,
    @ConnectedSocket() client: Socket
  ) {
    await this.gameService.setPlayerName(setPlayerNameDto, client.data.playerId);
  }

  @SubscribeMessage(SocketEvents.KICK_ROOM)
  @UsePipes(new GameValidationPipe(SocketEvents.KICK_ROOM))
  async handleKickRoom(@MessageBody() kickRoomDto: KickRoomDto, @ConnectedSocket() client: Socket) {
    await this.gameRoomService.kickRoom(kickRoomDto, client.id);
  }

  afterInit() {
    this.logger.verbose('WebSocket 서버 초기화 완료했어요!');

    this.gameService.subscribeRedisEvent(this.server).then(() => {
      this.logger.verbose('Redis 이벤트 등록 완료했어요!');
    });
    this.gameChatService.subscribeChatEvent(this.server).then(() => {
      this.logger.verbose('Redis Chat 이벤트 등록 완료했어요!');
    });

    this.server.engine['initial_headers'] = this.initialHeaders.bind(this);
  }

  initialHeaders(headers, request) {
    if (!request.headers.cookie) {
      request.headers['playerId'] = this.setNewPlayerIdToCookie(headers);
      return;
    }
    const cookies = parse(request.headers.cookie);
    if (!cookies.playerId) {
      request.headers['playerId'] = this.setNewPlayerIdToCookie(headers);
      return;
    }
    request.headers['playerId'] = cookies.playerId;
  }

  setNewPlayerIdToCookie(headers) {
    const playerId = uuidv4();
    headers['Set-Cookie'] = serialize('playerId', playerId);
    return playerId;
  }

  async handleConnection(client: Socket) {
    await this.gameService.connection(client);

    this.logger.verbose(`클라이언트가 연결되었어요!: ${client.data.playerId}`);
  }

  async handleDisconnect(client: Socket) {
    this.logger.verbose(`클라이언트가 연결 해제되었어요!: ${client.data.playerId}`);

    await this.gameService.disconnect(client.data.playerId);
    await this.gameRoomService.handlePlayerExit(client.data.playerId);
  }
}
