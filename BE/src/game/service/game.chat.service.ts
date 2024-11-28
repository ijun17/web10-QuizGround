import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { GameValidator } from '../validations/game.validator';
import { ChatMessageDto } from '../dto/chat-message.dto';
import { REDIS_KEY } from '../../common/constants/redis-key.constant';
import SocketEvents from '../../common/constants/socket-events';
import { Namespace } from 'socket.io';
import { TraceClass } from '../../common/interceptor/SocketEventLoggerInterceptor';

@TraceClass()
@Injectable()
export class GameChatService {
  private readonly logger = new Logger(GameChatService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly gameValidator: GameValidator
  ) {}

  async chatMessage(chatMessage: ChatMessageDto, clientId: string) {
    const { gameId, message } = chatMessage;
    const roomKey = REDIS_KEY.ROOM(gameId);

    const room = await this.redis.hgetall(roomKey);
    this.gameValidator.validateRoomExists(SocketEvents.CHAT_MESSAGE, room);

    const playerKey = REDIS_KEY.PLAYER(clientId);
    const player = await this.redis.hgetall(playerKey);

    this.gameValidator.validatePlayerInRoom(SocketEvents.CHAT_MESSAGE, gameId, player);

    await this.redis.publish(
      `chat:${gameId}`,
      JSON.stringify({
        playerId: clientId,
        playerName: player.playerName,
        message,
        timestamp: new Date()
      })
    );

    this.logger.verbose(
      `[chatMessage] Room: ${gameId} | playerId: ${clientId} | playerName: ${player.playerName} | isAlive: ${player.isAlive ? '생존자' : '관전자'} | Message: ${message}`
    );
  }

  async subscribeChatEvent(server: Namespace) {
    const chatSubscriber = this.redis.duplicate();
    chatSubscriber.psubscribe('chat:*');

    chatSubscriber.on('pmessage', async (_pattern, channel, message) => {
      const gameId = channel.split(':')[1]; // ex. channel: chat:317172
      const chatMessage = JSON.parse(message);

      const playerKey = REDIS_KEY.PLAYER(chatMessage.playerId);
      const isAlivePlayer = await this.redis.hget(playerKey, 'isAlive');

      if (isAlivePlayer === '1') {
        server.to(gameId).emit(SocketEvents.CHAT_MESSAGE, chatMessage);
        return;
      }

      // 죽은 사람의 채팅은 죽은 사람끼리만 볼 수 있도록 처리
      const players = await this.redis.smembers(REDIS_KEY.ROOM_PLAYERS(gameId));
      await Promise.all(
        players.map(async (playerId) => {
          const playerKey = REDIS_KEY.PLAYER(playerId);
          const isAlive = await this.redis.hget(playerKey, 'isAlive');

          if (isAlive === '0') {
            server.to(playerId).emit(SocketEvents.CHAT_MESSAGE, chatMessage);
          }
        })
      );
    });
  }
}
