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
  currentPlayerId: string;
  players: Player[];
  addPlayers: (players: Player[]) => void;
  updatePlayerPosition: (playerId: string, newPosition: [number, number]) => void; // 위치 업데이트
  updatePlayerScore: (playerId: string, newScore: number) => void;
  updatePlayerAnswer: (playerId: string, newIsAnswer: boolean) => void;
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
  // addPlayers(data.players);
  // const socketId = socketService.getSocketId();
  // if (data.players.length > 0 && data.players[0].playerId === socketId) {
  //   setCurrentPlayerId(socketId);
  // }
  const playersWithScore = data.players.map((player) => ({
    ...player,
    playerScore: player.playerScore ?? 0 // 점수 없으면 0으로 설정
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

socketService.on('exitRoom', (data) => {
  usePlayerStore.getState().removePlayer(data.playerId);
});

// 점수 업데이트 관련 소켓 이벤트 추가
// socketService.on('updateScore', (data) => {
//   usePlayerStore.getState().updatePlayerScore(data.playerId, data.playerScore);
// });

// 정답여부 업데이트 관련 소켓 이벤트 추가
// socketService.on('updateIsAnswer', (data) => {
//   usePlayerStore.getState().updateIsAnswer(data.playerId, data.isAnswer);
// });
