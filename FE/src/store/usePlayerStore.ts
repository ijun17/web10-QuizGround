import { socketService } from '@/api/socket';
import { create } from 'zustand';

type Player = {
  playerId: string; // socketId
  playerName: string;
  playerPosition: [number, number]; // [x, y] 좌표
};

type PlayerStore = {
  currentPlayerId: string;
  players: Player[];
  addPlayers: (players: Player[]) => void;
  updatePlayerPosition: (playerId: string, newPosition: [number, number]) => void; // 위치 업데이트
  removePlayer: (playerId: string) => void;
  setCurrentPlayerId: (currentPlayerId: string) => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  currentPlayerId: '',
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
  },

  setCurrentPlayerId: (currentPlayerId) => {
    set(() => ({ currentPlayerId }));
  }
}));

socketService.on('joinRoom', (data) => {
  const { addPlayers, setCurrentPlayerId } = usePlayerStore.getState();
  addPlayers(data.players);
  const socketId = socketService.getSocketId();
  if (data.players.length > 0 && data.players[0].playerId === socketId) {
    setCurrentPlayerId(socketId);
  }
});

socketService.on('updatePosition', (data) => {
  usePlayerStore.getState().updatePlayerPosition(data.playerId, data.playerPosition);
});

socketService.on('exitRoom', (data) => {
  usePlayerStore.getState().removePlayer(data.playerId);
});
