import Chat from '@/components/Chat';
import ParticipantDisplay from '@/components/ParticipantDisplay';
import { QuizOptionBoard } from '@/components/QuizOptionBoard';
import { Modal } from '../components/Modal';
import { useState, useEffect } from 'react';
import { GameHeader } from '@/components/GameHeader';
import { HeaderBar } from '@/components/HeaderBar';
import { socketService } from '@/api/socket';
import { useParams } from 'react-router-dom';
import { useRoomStore } from '@/store/useRoomStore';
import { QuizHeader } from '@/components/QuizHeader';
import GameState from '@/constants/gameState';
import { usePlayerStore } from '@/store/usePlayerStore';
import { ResultModal } from '@/components/ResultModal';

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const updateRoom = useRoomStore((state) => state.updateRoom);
  const gameState = useRoomStore((state) => state.gameState);
  const currentPlayerName = usePlayerStore((state) => state.currentPlayerName);
  const setCurrentPlayerName = usePlayerStore((state) => state.setCurrentPlayerName);
  const setGameState = useRoomStore((state) => state.setGameState);
  const [isModalOpen, setIsModalOpen] = useState(true);
  const [isResultOpen, setIsResultOpen] = useState(false);

  useEffect(() => {
    updateRoom({ gameId });
  }, [gameId, updateRoom]);

  useEffect(() => {
    if (gameId && currentPlayerName) {
      socketService.joinRoom(gameId, currentPlayerName);
    }
  }, [gameId, currentPlayerName]);

  useEffect(() => {
    if (gameState === GameState.END) {
      const timer = setTimeout(() => {
        setIsResultOpen(true);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [gameState]);

  // setCurrentPlayerName('test123');
  const handleNameSubmit = (name: string) => {
    setCurrentPlayerName(name);
    setIsModalOpen(false); // 이름이 설정되면 모달 닫기
  };

  const handleEndGame = () => {
    setGameState(GameState.WAIT);
    setIsResultOpen(false);
  };

  return (
    <>
      <HeaderBar />
      <div className="bg-surface-alt h-[calc(100vh-100px)] overflow-hidden">
        <div className="center p-4">
          {gameState === GameState.WAIT ? <GameHeader /> : <QuizHeader />}
        </div>
        <div className="grid grid-cols-4 grid-rows-1 gap-4 h-[calc(100%-320px)] p-4">
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
          <Modal
            isOpen={isModalOpen && !currentPlayerName} // playerName이 없을 때만 모달을 열도록 설정
            title="플레이어 이름 설정"
            placeholder="이름을 입력하세요"
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleNameSubmit}
          />
        </div>
      </div>
    </>
  );
};
