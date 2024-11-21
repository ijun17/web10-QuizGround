import { Controller, DefaultValuePipe, Get, ParseIntPipe, Query } from '@nestjs/common';
import { WaitingRoomService } from './waiting-room.service';

@Controller('/api/rooms')
export class WaitingRoomController {
  constructor(private readonly waitingRoomService: WaitingRoomService) {}

  @Get()
  async findAll(
    @Query('cursor', new DefaultValuePipe(1), ParseIntPipe) cursor: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
  ) {
    return this.waitingRoomService.findAllWaitingRooms(cursor, take);
  }
}
