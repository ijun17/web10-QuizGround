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

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const updateRoom = useRoomStore((state) => state.updateRoom);
  const [playerName, setPlayerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);

  updateRoom({ gameId });

  useEffect(() => {
    if (gameId && playerName) {
      socketService.joinRoom(gameId, playerName);
    }
  }, [gameId, playerName]);

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    setIsModalOpen(false); // 이름이 설정되면 모달 닫기
  };

  return (
    <>
      <HeaderBar />
      <div className="bg-surface-alt h-[calc(100vh-100px)]">
        <div className="center p-4">
          <GameHeader />
        </div>
        <div className="grid grid-cols-4 grid-rows-1 gap-4 h-[calc(100%-320px)] p-4">
          <div className="hidden lg:block lg:col-span-1">
            <Chat />
          </div>

          <div className="col-span-4 lg:col-span-2">
            <QuizOptionBoard options={['a', 'b', 'c']}></QuizOptionBoard>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <ParticipantDisplay />
          </div>

          <Modal
            isOpen={isModalOpen && !playerName} // playerName이 없을 때만 모달을 열도록 설정
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
