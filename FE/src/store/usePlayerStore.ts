import { socketService } from '@/api/socket';
import { create } from 'zustand';

type Player = {
  playerId: string; // socketId
  playerName: string;
  playerPosition: [number, number]; // [x, y] 좌표
};

type PlayerStore = {
  players: Player[];
  addPlayers: (players: Player[]) => void;
  updatePlayerPosition: (playerId: string, newPosition: [number, number]) => void; // 위치 업데이트
  removePlayer: (playerId: string) => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  players: [],

  addPlayers: (players) => {
    set((state) => ({
      players: [...state.players, ...players]
    }));
  },

  updatePlayerPosition: (playerId, newPosition) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.playerId === playerId ? { ...player, playerPosition: newPosition } : player
      )
    }));
  },

  removePlayer: (playerId) => {
    set((state) => ({
      players: state.players.filter((player) => player.playerId !== playerId)
    }));
  }
}));

socketService.on('joinRoom', (data) => {
  usePlayerStore.getState().addPlayers(data.players);
});

socketService.on('updatePosition', (data) => {
  usePlayerStore.getState().updatePlayerPosition(data.playerId, data.playerPosition);
});

socketService.on('exitRoom', (data) => {
  usePlayerStore.getState().removePlayer(data.playerId);
});
