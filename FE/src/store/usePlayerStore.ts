import { socketService } from '@/api/socket';
import { create } from 'zustand';
import { useRoomStore } from './useRoomStore';

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
  }
}));

socketService.onPermanently('joinRoom', (data) => {
  const { addPlayers, setCurrentPlayerId } = usePlayerStore.getState();
  const newPlayers = data.players.map((player) => ({
    ...player,
    playerScore: 0,
    isAlive: true,
    isAnswer: true
  }));
  addPlayers(newPlayers);
  const socketId = socketService.getSocketId();
  if (newPlayers.length > 0 && newPlayers[0].playerId === socketId) {
    setCurrentPlayerId(socketId);
  }
});

socketService.onPermanently('updatePosition', (data) => {
  usePlayerStore.getState().updatePlayerPosition(data.playerId, data.playerPosition);
});

socketService.onPermanently('endQuizTime', (data) => {
  const { players, setPlayers } = usePlayerStore.getState();
  const { gameMode } = useRoomStore.getState();

  setPlayers(
    data.players.map((p) => {
      const _p = players.find((e) => e.playerId === p.playerId);
      return {
        playerId: String(p.playerId),
        playerName: _p?.playerName || '',
        playerPosition: _p?.playerPosition || [0, 0],
        playerScore: p.score,
        isAnswer: p.isAnswer,
        isAlive: _p?.isAlive || false
      };
    })
  );

  // 서바이벌 모드일 경우 3초 뒤에 탈락한 플레이어를 보이지 않게 한다.
  if (gameMode === 'SURVIVAL') {
    setTimeout(() => {
      const { players, setPlayers } = usePlayerStore.getState();

      setPlayers(
        players.map((p) => {
          return {
            ...p,
            isAlive: p.isAlive && p?.isAnswer
          };
        })
      );
    }, 3000);
  }
});

socketService.onPermanently('endGame', (data) => {
  usePlayerStore.getState().setIsHost(data.hostId === socketService.getSocketId());
});

socketService.onPermanently('exitRoom', (data) => {
  usePlayerStore.getState().removePlayer(data.playerId);
});
