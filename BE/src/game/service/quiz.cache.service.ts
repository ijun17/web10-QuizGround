import { QuizSetData } from '../../InitDB/InitDB.Service';
import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { QuizService } from '../../quiz/quiz.service';
import { mockQuizData } from '../../../test/mocks/quiz-data.mock';

@Injectable()
export class QuizCacheService {
  private readonly quizCache = new Map<string, any>();
  private readonly logger = new Logger(QuizCacheService.name);
  private readonly CACHE_TTL = 1000 * 60 * 30; // 30분

  constructor(
    @InjectRedis() private readonly redis: Redis,
    private readonly quizService: QuizService
  ) {}

  /**
   * 캐시키 생성
   */
  private getCacheKey(quizSetId: number): string {
    return `quizset:${quizSetId}`;
  }

  /**
   * Redis 캐시에서 퀴즈셋 조회
   */
  private async getFromRedisCache(quizSetId: number) {
    const cacheKey = this.getCacheKey(quizSetId);
    const cachedData = await this.redis.get(cacheKey);

    if (cachedData) {
      return JSON.parse(cachedData);
    }
    return null;
  }

  /**
   * Redis 캐시에 퀴즈셋 저장
   */
  private async setToRedisCache(quizSetId: number, data: QuizSetData): Promise<void> {
    const cacheKey = this.getCacheKey(quizSetId);
    await this.redis.set(cacheKey, JSON.stringify(data), 'EX', this.CACHE_TTL);
  }

  /**
   * 퀴즈셋 데이터 조회 (캐시 활용)
   */
  async getQuizSet(quizSetId: number) {
    // 1. 로컬 메모리 캐시 확인
    // const localCached = this.quizCache.get(this.getCacheKey(quizSetId));
    // if (localCached) {
    //   this.logger.debug(`Quiz ${quizSetId} found in local cache`);
    //   return localCached;
    // }

    // 2. Redis 캐시 확인
    const redisCached = await this.getFromRedisCache(quizSetId);
    if (redisCached) {
      this.logger.debug(`Quiz ${quizSetId} found in Redis cache`);
      // 로컬 캐시에도 저장
      this.quizCache.set(this.getCacheKey(quizSetId), redisCached);
      return redisCached;
    }

    // 3. DB에서 조회
    const quizData = quizSetId === -1 ? mockQuizData : await this.quizService.findOne(quizSetId);

    // 4. 캐시에 저장
    await this.setToRedisCache(quizSetId, quizData);
    this.quizCache.set(this.getCacheKey(quizSetId), quizData);

    return quizData;
  }

  /**
   * 캐시 무효화
   */
  async invalidateCache(quizSetId: number): Promise<void> {
    const cacheKey = this.getCacheKey(quizSetId);
    this.quizCache.delete(cacheKey);
    await this.redis.del(cacheKey);
  }
}
