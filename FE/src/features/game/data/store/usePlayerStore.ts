import { create } from 'zustand';

type Player = {
  playerId: string;
  playerName: string;
  playerPosition: [number, number]; // [x, y] 좌표
  playerScore: number;
  isAnswer: boolean;
  isAlive: boolean;
  emoji: string;
  isHost: boolean;
};

type PlayerStore = {
  currentPlayerId: string;
  currentPlayerName: string;
  players: Map<string, Player>;
  addPlayers: (players: Player[]) => void;
  updatePlayerPosition: (playerId: string, newPosition: [number, number]) => void; // 위치 업데이트
  removePlayer: (playerId: string) => void;
  setCurrentPlayerId: (currentPlayerId: string) => void;
  setCurrentPlayerName: (currentPlayerName: string) => void;
  setPlayers: (players: Player[]) => void;
  resetScore: () => void;
  setPlayerName: (playerId: string, playerName: string) => void;
  setHost: (playerId: string) => void;
  reset: () => void;
};

const initialPlayerState = {
  currentPlayerId: '',
  currentPlayerName: '',
  players: new Map()
} as const;

export const usePlayerStore = create<PlayerStore>((set) => ({
  ...initialPlayerState,
  addPlayers: (players) => {
    set((state) => {
      const newPlayers = new Map(state.players);
      players.map((p) => newPlayers.set(p.playerId, p));

      return { players: newPlayers };
    });
  },
  updatePlayerPosition: (playerId, newPosition) => {
    set((state) => {
      const targetPlayer = state.players.get(playerId);
      if (targetPlayer)
        state.players.set(playerId, { ...targetPlayer, playerPosition: newPosition });
      return { players: state.players };
    });
  },
  setPlayers: (players: Player[]) => {
    const newPlayers = new Map(players.map((p) => [p.playerId, p]));
    set(() => ({ players: newPlayers }));
  },

  removePlayer: (playerId) => {
    set((state) => {
      state.players.delete(playerId);
      return { players: new Map(state.players) };
    });
  },

  setCurrentPlayerId: (currentPlayerId) => {
    set(() => ({ currentPlayerId }));
  },

  setCurrentPlayerName: (currentPlayerName) => {
    set(() => ({ currentPlayerName }));
  },

  resetScore: () => {
    set((state) => {
      state.players.forEach((value, key) => {
        state.players.set(key, { ...value, playerScore: 0, isAlive: true, isAnswer: true });
      });
      return { players: new Map(state.players) };
    });
  },
  setPlayerName: (playerId, playerName) => {
    set((state) => {
      const targetPlayer = state.players.get(playerId);
      if (targetPlayer) state.players.set(playerId, { ...targetPlayer, playerName });
      return { players: new Map(state.players) };
    });
  },
  setHost: (playerId) => {
    set((state) => {
      const newPlayers = new Map(state.players);
      newPlayers.forEach((player, id) => {
        newPlayers.set(id, { ...player, isHost: id === playerId });
      });
      return { players: newPlayers };
    });
  },
  reset: () => set(initialPlayerState)
}));
