import { ClipboardCopy } from './ClipboardCopy';
import Card from '@mui/material/Card';
import { QuizPreview } from './QuizPreview';
import { useParams } from 'react-router-dom';
import { useRoomStore } from '@/store/useRoomStore';
import { useState } from 'react';
import { QuizSettingModal } from './QuizSettingModal';
import { socketService } from '@/api/socket';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useQuizeStore } from '@/store/useQuizStore';

export const GameHeader = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const isHost = usePlayerStore((state) => state.isHost);
  const gameTitle = useRoomStore((state) => state.title);
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const { quizSetTitle, quizSetCategory } = useQuizeStore();
  const pinNum = String(gameId);
  const linkURL = window.location.hostname + `/game/${gameId}`;

  const handleStartGame = () => {
    if (gameId) socketService.emit('startGame', { gameId });
  };
  // 예시
  return (
    <Card className="p-4 border border-blue-600 shadow-xl rounded-md h-[280px] w-[1000px] bg-gradient-to-b from-blue-500 to-blue-700 text-white component-popup">
      <div className="flex justify-center mb-4">
        <ClipboardCopy valueToCopy={pinNum} message={`PIN: ${pinNum} 복사`} />
        <ClipboardCopy valueToCopy={linkURL} message="공유 링크 복사" />
      </div>
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <span className="text-xl font-semibold">{gameTitle}</span>
      </div>
      <QuizPreview title={quizSetTitle} description={quizSetCategory} />
      {isHost && (
        <div className="flex space-x-4 justify-center">
          <button
            className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-md shadow-lg transform hover:translate-y-[-2px] hover:shadow-xl active:translate-y-1 active:shadow-sm transition"
            onClick={() => setIsQuizModalOpen(true)}
          >
            퀴즈 설정
          </button>
          <button
            className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md shadow-lg transform hover:translate-y-[-2px] hover:shadow-xl active:translate-y-1 active:shadow-sm transition"
            onClick={handleStartGame}
          >
            게임 시작
          </button>
        </div>
      )}

      <QuizSettingModal isOpen={isQuizModalOpen} onClose={() => setIsQuizModalOpen(false)} />
    </Card>
  );
};
