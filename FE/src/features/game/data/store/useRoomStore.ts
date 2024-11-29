import { create } from 'zustand';
import GameState from '@/constants/gameState';

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
  gameState: (typeof GameState)[keyof typeof GameState];
  maxPlayerCount: number;
  isPublic: boolean;
  gameId: string;
  updateRoom: (roomOption: RoomOption) => void;
  setGameState: (state: (typeof GameState)[keyof typeof GameState]) => void;
  reset: () => void;
};

export const useRoomStore = create<RoomStore>((set) => ({
  title: '',
  gameMode: 'SURVIVAL',
  maxPlayerCount: 50,
  isPublic: true,
  gameId: '',
  gameState: GameState.WAIT,
  updateRoom: (roomOption: RoomOption) => {
    set(() => roomOption);
  },
  setGameState: (gameState) => {
    set(() => ({ gameState }));
  },
  reset: () =>
    set({
      title: '',
      gameMode: 'SURVIVAL',
      maxPlayerCount: 50,
      isPublic: true,
      gameId: '',
      gameState: GameState.WAIT
    })
}));
