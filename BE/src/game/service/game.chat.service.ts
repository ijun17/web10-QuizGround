import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { GameValidator } from '../validations/game.validator';
import { ChatMessageDto } from '../dto/chat-message.dto';
import { REDIS_KEY } from '../../common/constants/redis-key.constant';
import SocketEvents from '../../common/constants/socket-events';
import { Server } from 'socket.io';

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
    this.logger.verbose(`채팅 전송: ${gameId} - ${clientId} (${player.playerName}) = ${message}`);
  }

  async subscribeChatEvent(server: Server) {
    const chatSubscriber = this.redis.duplicate();
    chatSubscriber.psubscribe('chat:*');
    chatSubscriber.on('pmessage', async (channel, message) => {
      const key = channel.replace('chat:', '');
      const splitKey = key.split(':');
      const gameId = splitKey[1];
      const chatMessage = JSON.parse(message);
      server.to(gameId).emit(SocketEvents.CHAT_MESSAGE, chatMessage);
    });
  }
}
