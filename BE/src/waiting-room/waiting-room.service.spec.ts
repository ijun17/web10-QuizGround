import { Test, TestingModule } from '@nestjs/testing';
import { WaitingRoomService } from './waiting-room.service';
import { RoomListResponseDto } from './dto/waiting-room-list.response.dto';

const DEFAULT_REDIS_NAMESPACE = 'default';
const REDIS_MODULE_CONNECTION_TOKEN = `${DEFAULT_REDIS_NAMESPACE}_IORedisModuleConnectionToken`;

describe('WaitingRoomService', () => {
  let service: WaitingRoomService;
  let redisMock: any;

  beforeEach(async () => {
    redisMock = {
      keys: jest.fn(),
      hgetall: jest.fn(),
      scard: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WaitingRoomService,
        {
          provide: REDIS_MODULE_CONNECTION_TOKEN,
          useValue: redisMock,
        },
      ],
    }).compile();

    service = module.get<WaitingRoomService>(WaitingRoomService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAllWaitingRooms', () => {
    it('대기중인 방 목록을 정상적으로 반환한다', async () => {
      // Given
      const mockRoomKeys = ['Room:123', 'Room:456', 'Room:789:Players'];
      const mockRoom1 = {
        title: '방 제목 1',
        gameMode: 'NORMAL',
        maxPlayerCount: '4',
        isWaiting: '1',
        quizSetId: '1',
        quizSetTitle: '즐거운 퀴즈모음1'
      };
      const mockRoom2 = {
        title: '방 제목 2',
        gameMode: 'SPEED',
        maxPlayerCount: '6',
        isWaiting: '0',  // 대기중이 아닌 방
        quizSetId: '2',
        quizSetTitle: '즐거운 퀴즈모음2'
      };

      redisMock.keys.mockResolvedValue(mockRoomKeys);
      redisMock.hgetall.mockImplementation(async (key) => {
        if (key === 'Room:123') return mockRoom1;
        if (key === 'Room:456') return mockRoom2;
        return null;
      });
      redisMock.scard.mockResolvedValue(2);  // 현재 플레이어 수

      // When
      const result: RoomListResponseDto = await service.findAllWaitingRooms();

      // Then
      expect(result.roomList).toHaveLength(1);  // isWaiting이 1인 방만 포함되어야 함
      expect(result.roomList[0]).toEqual({
        title: '방 제목 1',
        gameMode: 'NORMAL',
        maxPlayerCount: 4,
        currentPlayerCount: 2,
        quizSetTitle: '즐거운 퀴즈모음1',
        gameId: '123'
      });

      expect(redisMock.keys).toHaveBeenCalledWith('Room:*');
      expect(redisMock.hgetall).toHaveBeenCalledWith('Room:123');
      expect(redisMock.hgetall).toHaveBeenCalledWith('Room:456');
      expect(redisMock.scard).toHaveBeenCalledWith('Room:123:Players');
    });

    it('대기중인 방이 없을 경우 빈 배열을 반환한다', async () => {
      // Given
      redisMock.keys.mockResolvedValue([]);

      // When
      const result = await service.findAllWaitingRooms();

      // Then
      expect(result.roomList).toEqual([]);
    });
  });
});