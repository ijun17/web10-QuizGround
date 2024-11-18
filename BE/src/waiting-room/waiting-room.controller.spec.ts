import { Test, TestingModule } from '@nestjs/testing';
import { WaitingRoomController } from './waiting-room.controller';
import { WaitingRoomService } from './waiting-room.service';

describe('WaitingRoomController', () => {
  let controller: WaitingRoomController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WaitingRoomController],
      providers: [WaitingRoomService],
    }).compile();

    controller = module.get<WaitingRoomController>(WaitingRoomController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
