import { Controller, Get } from '@nestjs/common';
import { WaitingRoomService } from './waiting-room.service';

@Controller('/api/rooms')
export class WaitingRoomController {
  constructor(private readonly waitingRoomService: WaitingRoomService) {}

  @Get()
  async findAll() {
    return this.waitingRoomService.findAllWaitingRooms();
  }
}
