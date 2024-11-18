import { Injectable } from '@nestjs/common';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { RoomDto, RoomListResponseDto } from './dto/waiting-room-list.response.dto';

@Injectable()
export class WaitingRoomService {
  constructor(@InjectRedis() private readonly redis: Redis) {}

  async findAllWaitingRooms(): Promise<RoomListResponseDto> {
    const rooms: RoomDto[] = [];

    const roomKeys = await this.redis.keys('Room:*');
    const gameRoomKeys = roomKeys.filter(key => {
      const parts = key.split(':');
      return parts.length === 2 && parts[0] === 'Room';
    });

    for (const roomKey of gameRoomKeys) {
      const gameId = roomKey.split(':')[1];
      const roomInfo = await this.redis.hgetall(roomKey);

      if (roomInfo.isWaiting === '1') {
        const currentPlayerCount = await this.redis.scard(`Room:${gameId}:Players`);

        // TODO: 실제 퀴즈셋 제목 조회 로직 필요 (애초에 Redis에 quizSetTitle을 저장하는 게 좋음)
        const quizSetTitle = `QuizSet ${roomInfo.quizSetId}`;

        rooms.push({
          title: roomInfo.title,
          gameMode: roomInfo.gameMode,
          maxPlayerCount: parseInt(roomInfo.maxPlayerCount),
          currentPlayerCount: currentPlayerCount,
          quizSetTitle: quizSetTitle,
          gameId: gameId
        });
      }
    }

    return {
      roomList: rooms
    };
  }
}
