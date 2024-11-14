import { socketService } from '@/api/socket';
import { create } from 'zustand';

type Player = {
  playerId: string; // socketId
  playerName: string;
  playerPosition: [number, number]; // [x, y] 좌표
  playerScore: number;
  isAnswer?: boolean;
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
  }
}));

socketService.on('joinRoom', (data) => {
  const { addPlayers, setCurrentPlayerId } = usePlayerStore.getState();
  const playersWithScore = data.players.map((player) => ({
    ...player,
    playerScore: 0 // 점수 없으면 0으로 설정
  }));
  addPlayers(playersWithScore);
  const socketId = socketService.getSocketId();
  if (playersWithScore.length > 0 && playersWithScore[0].playerId === socketId) {
    setCurrentPlayerId(socketId);
  }
});

socketService.on('updatePosition', (data) => {
  usePlayerStore.getState().updatePlayerPosition(data.playerId, data.playerPosition);
});

socketService.on('endQuizTime', (data) => {
  const { players, setPlayers } = usePlayerStore.getState();
  setPlayers(
    data.players.map((p) => ({
      playerId: String(p.playerId),
      playerName: players.find((e) => e.playerId === p.playerId)?.playerName || '',
      playerPosition: players.find((e) => e.playerId === p.playerId)?.playerPosition || [0, 0],
      playerScore: p.score,
      isAnswer: p.isAnswer
    }))
  );
});

socketService.on('exitRoom', (data) => {
  usePlayerStore.getState().removePlayer(data.playerId);
});
