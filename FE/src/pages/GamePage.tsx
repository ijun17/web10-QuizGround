import Chat from '@/components/Chat';
import ParticipantDisplay from '@/components/ParticipantDisplay';
import { QuizOptionBoard } from '@/components/QuizOptionBoard';
import { Modal } from '../components/Modal';
import { useState } from 'react';
import { GameHeader } from '@/components/GameHeader';
import { HeaderBar } from '@/components/HeaderBar';
import { useParams } from 'react-router-dom';
import { socketService } from '@/api/socket';

export const GamePage = () => {
  const [playerName, setPlayerName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(true);
  const pin = useParams();

  const handleNameSubmit = (name: string) => {
    setPlayerName(name);
    // 닉네임 설정 소켓 요청
    socketService.joinRoom(String(pin), name);
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
            <Chat></Chat>
          </div>

          <div className="col-span-4 lg:col-span-2">
            <QuizOptionBoard options={['a', 'b', 'c']}></QuizOptionBoard>
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <ParticipantDisplay></ParticipantDisplay>
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
