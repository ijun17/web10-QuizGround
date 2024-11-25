import { create } from 'zustand';

type Player = {
  playerId: string; // socketId
  playerName: string;
  playerPosition: [number, number]; // [x, y] 좌표
  playerScore: number;
  isAnswer: boolean;
  isAlive: boolean;
};

type PlayerStore = {
  isHost: boolean;
  currentPlayerId: string;
  currentPlayerName: string;
  players: Player[];
  addPlayers: (players: Player[]) => void;
  updatePlayerPosition: (playerId: string, newPosition: [number, number]) => void; // 위치 업데이트
  updatePlayerScore: (playerId: string, newScore: number) => void;
  updatePlayerAnswer: (playerId: string, newIsAnswer: boolean) => void;
  removePlayer: (playerId: string) => void;
  setCurrentPlayerId: (currentPlayerId: string) => void;
  setCurrentPlayerName: (currentPlayerName: string) => void;
  setIsHost: (isHost: boolean) => void;
  setPlayers: (players: Player[]) => void;
  resetScore: () => void;
  reset: () => void;
};

export const usePlayerStore = create<PlayerStore>((set) => ({
  isHost: false,
  currentPlayerId: '',
  currentPlayerName: '',
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

  updatePlayerScore: (playerId, newScore) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.playerId === playerId ? { ...player, playerScore: newScore } : player
      )
    }));
  },

  updatePlayerAnswer: (playerId, newIsAnswer) => {
    set((state) => ({
      players: state.players.map((player) =>
        player.playerId === playerId ? { ...player, isAnswer: newIsAnswer } : player
      )
    }));
  },

  setPlayers: (players: Player[]) => {
    set(() => ({ players }));
  },

  removePlayer: (playerId) => {
    set((state) => ({
      players: state.players.filter((player) => player.playerId !== playerId)
    }));
  },

  setCurrentPlayerId: (currentPlayerId) => {
    set(() => ({ currentPlayerId }));
  },

  setCurrentPlayerName: (currentPlayerName) => {
    set(() => ({ currentPlayerName }));
  },

  setIsHost: (isHost) => {
    set(() => ({ isHost }));
  },

  resetScore: () => {
    set((state) => ({
      players: state.players.map((p) => ({ ...p, playerScore: 0, isAlive: true, isAnswer: true }))
    }));
  },
  reset: () => set({ players: [], isHost: false, currentPlayerId: '', currentPlayerName: '' })
}));
