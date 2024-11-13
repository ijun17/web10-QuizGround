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
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
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

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly gameService: GameService
  ) {}

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
    const { players, newPlayer } = await this.gameService.joinRoom(dto, client.id);

    client.join(dto.gameId);
    client.emit(SocketEvents.JOIN_ROOM, { players });
    this.server.to(dto.gameId).emit(SocketEvents.JOIN_ROOM, {
      players: [newPlayer]
    });
  }

  @SubscribeMessage(SocketEvents.UPDATE_POSITION)
  @UsePipes(new GameValidationPipe(SocketEvents.UPDATE_POSITION))
  async handleUpdatePosition(
    @MessageBody() updatePosition: UpdatePositionDto,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const result = await this.gameService.updatePosition(updatePosition, client.id);
    this.server.to(updatePosition.gameId).emit(SocketEvents.UPDATE_POSITION, result);
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

  // TODO: Redis에 맞게 구현해야 함. (아직 초안이라 해서, redis로 바로 수정하지 않았음)
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

    this.subscribeRedisEvent().then(() => {
      this.logger.verbose('Redis 이벤트 등록 완료했어요!');
    });
  }

  async subscribeRedisEvent() {
    const subscriber = this.redis.duplicate();
    await subscriber.subscribe('__keyspace@0__:Room:*');

    subscriber.on('message', async (channel, message) => {
      const key = channel.replace('__keyspace@0__:', '');
      const splitKey = key.split(':');
      if (splitKey.length !== 2) {
        return;
      }
      const gameId = splitKey[1];

      if (message === 'hset') {
        const changes = await this.redis.get(`${key}:Changes`);
        const roomData = await this.redis.hgetall(key);

        if (changes === 'Option') {
          this.server.to(gameId).emit(SocketEvents.UPDATE_ROOM_OPTION, {
            title: roomData.title,
            gameMode: roomData.gameMode,
            maxPlayerCount: roomData.maxPlayerCount,
            isPublic: roomData.isPublic
          });
        } else if (changes === 'Quizset') {
          this.server.to(gameId).emit(SocketEvents.UPDATE_ROOM_QUIZSET, {
            quizSetId: roomData.quizSetId,
            quizCount: roomData.quizCount
          });
        } else if (changes === 'Start') {
          this.server.to(gameId).emit(SocketEvents.START_GAME, '');
        }
      }
    });
  }

  handleConnection(client: Socket) {
    this.logger.verbose(`클라이언트가 연결되었어요!: ${client.id}`);
  }
}
