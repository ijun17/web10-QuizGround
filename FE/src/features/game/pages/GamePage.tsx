import Chat from '@/features/game/components/Chat';
import ParticipantDisplay from '@/features/game/components/ParticipantDisplay';
import { QuizOptionBoard } from '@/features/game/components/QuizOptionBoard';
import { NicknameModal } from '../components/NicknameModal';
import { useState, useEffect } from 'react';
import { GameHeader } from '@/features/game/components/GameHeader';
import { HeaderBar } from '@/components/HeaderBar';
import { socketService, useSocketException } from '@/api/socket';
import { useParams } from 'react-router-dom';
import { useRoomStore } from '../data/store/useRoomStore';
import { QuizHeader } from '@/features/game/components/QuizHeader';
import GameState from '@/constants/gameState';
import { usePlayerStore } from '@/features/game/data/store/usePlayerStore';
import { ResultModal } from '@/features/game/components/ResultModal';
import { ErrorModal } from '@/components/ErrorModal';
import { useNavigate } from 'react-router-dom';
import { getRandomNickname } from '@/features/game/utils/nickname';
import { resetEmojiPool } from '../utils/emoji';

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const updateRoom = useRoomStore((state) => state.updateRoom);
  const gameState = useRoomStore((state) => state.gameState);
  const currentPlayerName = usePlayerStore((state) => state.currentPlayerName);
  // const setCurrentPlayerName = usePlayerStore((state) => state.setCurrentPlayerName);
  const setGameState = useRoomStore((state) => state.setGameState);
  const resetScore = usePlayerStore((state) => state.resetScore);
  // const [isModalOpen, setIsModalOpen] = useState(true);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [isResultOpen, setIsResultOpen] = useState(false);
  const navigate = useNavigate();

  // 페이지에서 나갈때
  // 스트릭트 모드에서 마운트 > 언마운트 > 마운트됨
  // useEffect(() => {
  //   return () => {
  //     console.log('게임방에서 나갔습니다');
  //     socketService.disconnect();
  //   };
  // }, []);

  useEffect(() => {
    if (gameId) resetEmojiPool(gameId);
  }, [gameId]);

  useEffect(() => {
    if (gameId) socketService.joinRoom(gameId);
  }, [gameId]);

  useEffect(() => {
    updateRoom({ gameId });
  }, [gameId, updateRoom]);

  useEffect(() => {
    if (gameState === GameState.END) setIsResultOpen(true);
  }, [gameState]);

  useSocketException('joinRoom', (data) => {
    setErrorModalTitle(data);
    setIsErrorModalOpen(true);
  });

  const handleEndGame = () => {
    setGameState(GameState.WAIT);
    resetScore();
    setIsResultOpen(false);
  };

  const handleSubmitNickname = (name: string) => {
    socketService.emit('setPlayerName', { playerName: name });
  };

  return (
    <>
      <HeaderBar />
      <div className="bg-surface-alt h-[calc(100vh-100px)] overflow-hidden">
        <div className="center p-4 pb-0 h-[30%]">
          {gameState === GameState.WAIT ? <GameHeader /> : <QuizHeader />}
        </div>
        <div className="grid grid-cols-4 grid-rows-1 gap-4 h-[70%] p-4">
          <div className="hidden lg:block lg:col-span-1">
            <Chat />
          </div>

          <div className="col-span-4 lg:col-span-2">
            <QuizOptionBoard />
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <ParticipantDisplay gameState={gameState} />
          </div>
          <ResultModal
            isOpen={isResultOpen}
            onClose={handleEndGame}
            currentPlayerName={currentPlayerName}
          />
          <NicknameModal
            isOpen={!currentPlayerName} // playerName이 없을 때만 모달을 열도록 설정
            title="플레이어 이름 설정"
            placeholder="이름을 입력하세요"
            initialValue={getRandomNickname()}
            onSubmit={handleSubmitNickname}
          />

          <ErrorModal
            isOpen={isErrorModalOpen}
            title={errorModalTitle}
            buttonText="메인 페이지로 이동"
            onClose={() => navigate('/')}
          />
        </div>
      </div>
    </>
  );
};
