import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { GameValidator } from '../validations/game.validator';
import { ChatMessageDto } from '../dto/chat-message.dto';
import { REDIS_KEY } from '../../common/constants/redis-key.constant';
import SocketEvents from '../../common/constants/socket-events';
import { Namespace } from 'socket.io';
import { TraceClass } from '../../common/interceptor/SocketEventLoggerInterceptor';
import { SurvivalStatus } from '../../common/constants/game';
import { BatchProcessor, BatchProcessorType } from './batch.processor';
import { CHAT_BATCH_TIME } from '../../common/constants/batch-time';

@TraceClass()
@Injectable()
export class GameChatService {
  private readonly logger = new Logger(GameChatService.name);

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly gameValidator: GameValidator,
    private chatProcessor: BatchProcessor
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
    this.chatProcessor.initialize(server, SocketEvents.CHAT_MESSAGE);
    this.chatProcessor.startProcessing(CHAT_BATCH_TIME);

    const chatSubscriber = this.redis.duplicate();
    chatSubscriber.psubscribe('chat:*');

    chatSubscriber.on('pmessage', async (_pattern, channel, message) => {
      const gameId = channel.split(':')[1]; // ex. channel: chat:317172
      const chatMessage = JSON.parse(message);

      const playerKey = REDIS_KEY.PLAYER(chatMessage.playerId);
      const isAlivePlayer = await this.redis.hget(playerKey, 'isAlive');

      // 생존한 사람이라면 전체 브로드캐스팅
      if (isAlivePlayer === SurvivalStatus.ALIVE) {
        this.chatProcessor.logMetricStart(BatchProcessorType.DEFAULT, gameId);
        this.chatProcessor.pushData(BatchProcessorType.DEFAULT, gameId, chatMessage);
      } else {
        this.chatProcessor.logMetricStart(BatchProcessorType.ONLY_DEAD, gameId);
        this.chatProcessor.pushData(BatchProcessorType.ONLY_DEAD, gameId, chatMessage);
      }
    });
  }
}
