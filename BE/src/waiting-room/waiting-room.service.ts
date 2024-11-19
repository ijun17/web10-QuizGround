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

      if (roomInfo.isWaiting !== '1') {
        continue;
      }

      const currentPlayerCount = await this.redis.scard(`Room:${gameId}:Players`);
      rooms.push({
        title: roomInfo.title,
        gameMode: roomInfo.gameMode,
        maxPlayerCount: parseInt(roomInfo.maxPlayerCount),
        currentPlayerCount: currentPlayerCount,
        quizSetTitle: roomInfo.quizSetTitle,
        gameId: gameId
      });
    }

    return {
      roomList: rooms
    };
  }
}
