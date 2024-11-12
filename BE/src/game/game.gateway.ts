import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
import { WsExceptionFilter } from '../common/filters/ws-exception.filter';
import socketEvents from '../common/constants/socket-events';
import { CreateGameDto } from './dto/create-game.dto';
import { JoinRoomDto } from './dto/join-room.dto';
import { ChatMessageDto } from './dto/chat-message.dto';
import { GameService } from './game.service';
import { generateUniquePin } from '../common/utils/utils';
import { UpdatePositionDto } from './dto/update-position.dto';
import { ValidateRoom } from './decorators/validate-room.decorator';
import { StartGameDto } from './dto/start-game.dto';

export type GameConfig = {
  title: string;
  gameMode: string;
  maxPlayerCount: number;
  isPublicGame: boolean;
};

type GameRoom = {
  id: string;
  host: string;
  players: Map<string, player>;
  config: GameConfig;
  createdAt: Date;
  status: 'waiting' | 'playing' | 'finished';
};

type player = {
  nickname: string;
  score: number;
  isHost: boolean;
  joinedAt: Date;
  position: [number, number];
};

@UseFilters(new WsExceptionFilter())
@UsePipes(
  new ValidationPipe({
    transform: true,
    exceptionFactory: (errors) => {
      return new WsException({
        status: 'error',
        message: Object.values(errors[0].constraints)[0]
      });
    }
  })
)
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
  private rooms: Map<string, GameRoom> = new Map();

  constructor(private readonly gameService: GameService) {}

  @SubscribeMessage(socketEvents.CREATE_ROOM)
  handleCreateRoom(
    @MessageBody() gameConfig: CreateGameDto,
    @ConnectedSocket() client: Socket
  ): void {
    const roomId = generateUniquePin(this.rooms);
    const newGame: GameRoom = {
      id: roomId,
      host: client.id,
      players: new Map(),
      config: gameConfig,
      createdAt: new Date(),
      status: 'waiting'
    };
    this.rooms.set(roomId, newGame);

    client.emit(socketEvents.CREATE_ROOM, {
      gameId: roomId
    });
    this.logger.verbose(`게임 방 생성 완료: ${roomId}`);
  }

  @SubscribeMessage(socketEvents.JOIN_ROOM)
  handleJoinRoom(@MessageBody() dto: JoinRoomDto, @ConnectedSocket() client: Socket): void {
    const room = this.rooms.get(dto.gameId);
    if (!room) {
      client.emit('error', '[ERROR] 존재하지 않는 게임 방입니다.');
      return;
    }
    if (room.players.size >= room.config.maxPlayerCount) {
      client.emit('error', '[ERROR] 게임 방 최대 인원이 모두 찼습니다.');
      return;
    }

    client.join(dto.gameId);
    const newPlayer: player = {
      nickname: dto.playerName,
      score: 0,
      isHost: room.host === client.id,
      joinedAt: new Date(),
      position: [Math.random(), Math.random()]
    };

    client.emit(socketEvents.JOIN_ROOM, {
      players: Array.from(room.players.entries()).map(([playerId, player]) => ({
        playerId: playerId,
        playerName: player.nickname,
        playerPosition: player.position
      }))
    });
    this.server.to(dto.gameId).emit(socketEvents.JOIN_ROOM, {
      players: [
        { playerId: client.id, playerName: newPlayer.nickname, playerPosition: newPlayer.position }
      ]
    });

    room.players.set(client.id, newPlayer);
    this.logger.verbose(`게임 방 입장 완료: ${dto.gameId} - ${client.id} (${dto.playerName})`);
  }

  @SubscribeMessage(socketEvents.UPDATE_POSITION)
  handleUpdatePosition(
    @MessageBody() updatePosition: UpdatePositionDto,
    @ConnectedSocket() client: Socket
  ): void {
    const { gameId, newPosition } = updatePosition;
    const room = this.rooms.get(gameId);

    if (!room) {
      client.emit('error', '[ERROR] 존재하지 않는 게임 방입니다.');
      return;
    }

    const player = room.players.get(client.id);
    if (!player) {
      client.emit('error', '[ERROR] 해당 게임 방의 플레이어가 아닙니다.');
      return;
    }

    player.position = newPosition;
    this.server.to(gameId).emit(socketEvents.UPDATE_POSITION, {
      playerId: client.id,
      playerPosition: newPosition
    });
    this.logger.verbose(
      `플레이어 위치 업데이트: ${gameId} - ${client.id} (${player.nickname}) = ${newPosition}`
    );
  }

  @SubscribeMessage(socketEvents.CHAT_MESSAGE)
  handleChatMessage(
    @MessageBody() chatMessage: ChatMessageDto,
    @ConnectedSocket() client: Socket
  ): void {
    const { gameId, message } = chatMessage;
    const room = this.rooms.get(gameId);

    // TODO: 예외 어노테이션으로 변경하는 법 있는지 확인
    if (!room) {
      client.emit('error', '[ERROR] 존재하지 않는 게임 방입니다.');
      return;
    }

    const player = room.players.get(client.id);
    if (!player) {
      client.emit('error', '[ERROR] 해당 게임 방의 플레이어가 아닙니다.');
      return;
    }

    const messageToSend = {
      playerId: client.id,
      playerName: player.nickname,
      message: message,
      timestamp: new Date()
    };

    this.server.to(gameId).emit(socketEvents.CHAT_MESSAGE, messageToSend);
    this.logger.verbose(
      `채팅 전송: ${gameId} - ${client.id} (${player.nickname}) = ${messageToSend}`
    );
  }

  @SubscribeMessage(socketEvents.START_GAME)
  @ValidateRoom()
  handleStartGame(
    @MessageBody() startGameDto: StartGameDto,
    @ConnectedSocket() client: Socket
  ): void {
    const { gameId } = startGameDto;
    const room = this.rooms.get(gameId);

    if (room.host !== client.id) {
      client.emit('error', '[ERROR] 방장만 게임을 시작할 수 있습니다.');
      return;
    }

    room.status = 'playing';
    this.server.to(gameId).emit(socketEvents.START_GAME, 'gameStarted');
    this.logger.verbose(`게임 시작: ${gameId}`);
  }

  @SubscribeMessage(socketEvents.START_QUIZ_TIME)
  @ValidateRoom()
  handleStartQuizTime(
    @MessageBody() startGameDto: StartGameDto,
    @ConnectedSocket() client: Socket
  ): void {
    const { gameId } = startGameDto;
    const room = this.rooms.get(gameId);

    if (room.host !== client.id) {
      client.emit('error', '[ERROR] 방장만 퀴즈를 시작할 수 있습니다.');
      return;
    }

    if (room.status !== 'playing') {
      client.emit('error', '[ERROR] 게임이 시작되지 않았습니다.');
      return;
    }

    this.server.to(gameId).emit(socketEvents.START_QUIZ_TIME, 'gameStarted');
    this.logger.verbose(`퀴즈 시간 시작: ${gameId}`);
  }

  // TODO: 일정 시간 동안 게임 방이 사용되지 않으면 방 정리 (@Cron으로 구현)

  afterInit() {
    this.logger.verbose('WebSocket 서버 초기화 완료했어요!');
  }

  handleConnection(client: Socket) {
    this.logger.verbose(`클라이언트가 연결되었어요!: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.logger.verbose(`클라이언트가 연결 해제되었어요!: ${client.id}`);
    this.rooms.forEach((room, roomId) => {
      if (room.players.has(client.id)) {
        const player = room.players.get(client.id);
        room.players.delete(client.id);
        if (player.isHost && room.players.size > 0) {
          const newHostId = room.players.keys()[0];
          const newHost = room.players.get(newHostId);
          newHost.isHost = true;
          room.host = newHostId;
          // TODO: 호스트 변경 클라이언트에게 보내주기
        }
        this.server.to(room.id).emit(socketEvents.EXIT_ROOM, { playerId: client.id });
      }
      if (room.players.size === 0) {
        this.rooms.delete(roomId); // TODO: delete는 성능이 좋지 않음. 우선 임시로 사용하고 향후 Redis로 개선
      }
    });
  }
}
