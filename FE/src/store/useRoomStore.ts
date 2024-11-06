import { socketService } from '@/api/socket';
import { create } from 'zustand';

type RoomOption = {
  title?: string;
  gameMode?: 'RANKING' | 'SURVIVAL';
  maxPlayerCount?: number;
  isPublic?: boolean;
  gameId?: string;
};

type RoomStore = {
  title: string;
  gameMode: 'RANKING' | 'SURVIVAL';
  maxPlayerCount: number;
  isPublic: boolean;
  gameId: string;
  updateRoom: (roomOption: RoomOption) => void;
};

export const useRoomStore = create<RoomStore>((set) => ({
  title: '',
  gameMode: 'SURVIVAL',
  maxPlayerCount: 50,
  isPublic: true,
  gameId: '',
  updateRoom: (roomOption: RoomOption) => {
    set(() => roomOption);
  }
}));

socketService.on('createRoom', (data) => {
  useRoomStore.getState().updateRoom({ gameId: data.gameId });
});

socketService.on('updateRoomOption', (data) => {
  useRoomStore.getState().updateRoom(data);
});
