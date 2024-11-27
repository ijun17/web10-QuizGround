import { socketService } from '@/api/socket';
import { useChatStore } from './store/useChatStore';
import { usePlayerStore } from './store/usePlayerStore';
import { useQuizStore } from './store/useQuizStore';
import { useRoomStore } from './store/useRoomStore';
import GameState from '@/constants/gameState';
import QuizState from '@/constants/quizState';
import { getQuizSetDetail } from '@/api/rest/quizApi';
import { getEmoji } from '../utils/emoji';

// chat
socketService.on('chatMessage', (data) => {
  useChatStore.getState().addMessage(data);
});

// player
socketService.on('joinRoom', (data) => {
  const { addPlayers } = usePlayerStore.getState();
  const newPlayers = data.players.map((player) => ({
    ...player,
    playerScore: 0,
    isAlive: true,
    isAnswer: true,
    emoji: getEmoji()
  }));
  addPlayers(newPlayers);
});

socketService.on('updatePosition', (data) => {
  usePlayerStore.getState().updatePlayerPosition(data.playerId, data.playerPosition);
});

socketService.on('endQuizTime', (data) => {
  const { players, setPlayers } = usePlayerStore.getState();
  const { gameMode } = useRoomStore.getState();

  setPlayers(
    data.players.map((p) => {
      const _p = players.get(p.playerId);
      return {
        playerId: String(p.playerId),
        playerName: _p?.playerName || '',
        playerPosition: _p?.playerPosition || [0, 0],
        playerScore: p.score,
        isAnswer: p.isAnswer,
        isAlive: _p?.isAlive || false,
        emoji: _p?.emoji || 'o'
      };
    })
  );

  // 서바이벌 모드일 경우 3초 뒤에 탈락한 플레이어를 보이지 않게 한다.
  if (gameMode === 'SURVIVAL') {
    setTimeout(() => {
      const { players, setPlayers } = usePlayerStore.getState();

      setPlayers(
        Array.from(players, ([, p]) => {
          return {
            ...p,
            isAlive: p.isAlive && p?.isAnswer
          };
        })
      );
    }, 3000);
  }
});

socketService.on('endGame', (data) => {
  usePlayerStore.getState().setIsHost(data.hostId === usePlayerStore.getState().currentPlayerId);
});

socketService.on('exitRoom', (data) => {
  usePlayerStore.getState().removePlayer(data.playerId);
});

socketService.on('getSelfId', (data) => {
  const playerName = usePlayerStore.getState().players.get(data.playerId);
  usePlayerStore.getState().setCurrentPlayerId(data.playerId);
  usePlayerStore.getState().setCurrentPlayerName(String(playerName));
});

socketService.on('setPlayerName', (data) => {
  usePlayerStore.getState().setPlayerName(data.playerId, data.playerName);
  if (data.playerId === usePlayerStore.getState().currentPlayerId) {
    usePlayerStore.getState().setCurrentPlayerName(data.playerName);
  }
});

// Quiz

// 진행 중인 퀴즈 설정
socketService.on('startQuizTime', (data) => {
  useQuizStore.getState().setQuizState(QuizState.START);
  useQuizStore.getState().setCurrentQuiz(data);
});
socketService.on('endQuizTime', (data) => {
  useQuizStore.getState().setQuizState(QuizState.END);
  useQuizStore.getState().setCurrentAnswer(Number(data.answer));
});

socketService.on('endGame', () => {
  useQuizStore.getState().resetQuiz();
});

// TODO update 퀴즈 셋 시 퀴즈셋 받아오기
socketService.on('updateRoomQuizset', async (data) => {
  const res = await getQuizSetDetail(String(data.quizSetId));
  useQuizStore.getState().setQuizSet(String(res?.title), String(res?.category));
});

// Room

socketService.on('createRoom', (data) => {
  useRoomStore.getState().updateRoom({ gameId: data.gameId });
});

socketService.on('updateRoomOption', (data) => {
  useRoomStore.getState().updateRoom(data);
});

socketService.on('startGame', () => {
  useRoomStore.getState().setGameState(GameState.PROGRESS);
});

socketService.on('endGame', () => {
  useRoomStore.getState().setGameState(GameState.END);
});

socketService.on('kickRoom', () => {
  alert('강퇴당하였습니다.');
  // 메인페이지 or 로비로 이동시키기?
});

// 소켓 연결 해제시 초기화

socketService.on('disconnect', () => {
  useRoomStore.getState().reset();
  usePlayerStore.getState().reset();
  useChatStore.getState().reset();
  useQuizStore.getState().reset();
});
