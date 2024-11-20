import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Cron, CronExpression } from '@nestjs/schedule';
import { REDIS_KEY } from '../../common/constants/redis-key.constant';

@Injectable()
export class GameRedisMemoryService {
  private readonly logger = new Logger(GameRedisMemoryService.name);

  // TTL 설정값 (초 단위)
  private readonly TTL = {
    ROOM: 3 * 60 * 60, // 방: 3시간
    PLAYER: 2 * 60 * 60, // 플레이어: 2시간
    QUIZ: 1 * 60 * 60, // 퀴즈: 1시간
    LEADERBOARD: 3 * 60 * 60 // 리더보드: 3시간
  };

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * 매 10분마다 TTL이 없는 키들을 검사하고 TTL 설정
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async manageTTL(): Promise<void> {
    try {
      // 활성화된 방 목록 조회
      const activeRooms = await this.redis.smembers(REDIS_KEY.ACTIVE_ROOMS);

      for (const roomId of activeRooms) {
        await this.setRoomTTL(roomId);
      }

      this.logger.verbose(`TTL 관리 완료: ${activeRooms.length}개 방 처리됨`);
    } catch (error) {
      this.logger.error('TTL 관리 실패', error?.message);
    }
  }

  /**
   * 특정 방의 모든 관련 키에 TTL 설정
   */
  private async setRoomTTL(roomId: string): Promise<void> {
    try {
      // 방 관련 키들의 TTL 확인 및 설정
      const keys = [
        // 방 기본 정보
        REDIS_KEY.ROOM(roomId),
        // 플레이어 목록
        REDIS_KEY.ROOM_PLAYERS(roomId),
        // 리더보드
        REDIS_KEY.ROOM_LEADERBOARD(roomId),
        // 현재 퀴즈
        REDIS_KEY.ROOM_CURRENT_QUIZ(roomId)
      ];

      // 각 키의 TTL 확인 및 설정
      for (const key of keys) {
        const ttl = await this.redis.ttl(key);
        // TTL이 설정되지 않은 경우(-1) 또는 TTL이 없는 경우(-2)
        if (ttl < 0) {
          await this.redis.expire(key, this.TTL.ROOM);
          this.logger.debug(`TTL 설정됨: ${key}`);
        }
      }

      // 해당 방의 플레이어들 TTL 설정
      const players = await this.redis.smembers(REDIS_KEY.ROOM_PLAYERS(roomId));
      for (const playerId of players) {
        const playerKey = REDIS_KEY.PLAYER(playerId);
        const ttl = await this.redis.ttl(playerKey);
        if (ttl < 0) {
          await this.redis.expire(playerKey, this.TTL.PLAYER);
        }
      }

      // 퀴즈 관련 키들 TTL 설정
      const quizList = await this.redis.smembers(REDIS_KEY.ROOM_QUIZ_SET(roomId));
      for (const quizId of quizList) {
        const quizKeys = [
          REDIS_KEY.ROOM_QUIZ(roomId, quizId),
          REDIS_KEY.ROOM_QUIZ_CHOICES(roomId, quizId)
        ];

        for (const key of quizKeys) {
          const ttl = await this.redis.ttl(key);
          if (ttl < 0) {
            await this.redis.expire(key, this.TTL.QUIZ);
          }
        }
      }
    } catch (error) {
      this.logger.error(`방 ${roomId}의 TTL 설정 실패`, error?.message);
    }
  }
}
