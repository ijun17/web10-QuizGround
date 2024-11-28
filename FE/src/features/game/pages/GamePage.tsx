import Chat from '@/features/game/components/Chat';
import ParticipantDisplay from '@/features/game/components/ParticipantDisplay';
import { QuizOptionBoard } from '@/features/game/components/QuizOptionBoard';
import { NicknameModal } from '../components/NicknameModal';
import { useState, useEffect } from 'react';
import { GameHeader } from '@/features/game/components/GameHeader';
// import { HeaderBar } from '@/components/HeaderBar';
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
import { KickModal } from '../components/KickModal';
import PingEffect from '../components/PingEffect';

export const GamePage = () => {
  const { gameId } = useParams<{ gameId: string }>();
  const updateRoom = useRoomStore((state) => state.updateRoom);
  const gameState = useRoomStore((state) => state.gameState);
  const currentPlayerName = usePlayerStore((state) => state.currentPlayerName);
  const setGameState = useRoomStore((state) => state.setGameState);
  const resetScore = usePlayerStore((state) => state.resetScore);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorModalTitle, setErrorModalTitle] = useState('');
  const [isResultOpen, setIsResultOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameId) socketService.joinRoom(gameId);
  }, [gameId]);

  useEffect(() => {
    updateRoom({ gameId });
  }, [gameId, updateRoom]);

  useEffect(() => {
    if (gameState === GameState.END) setIsResultOpen(true);
  }, [gameState]);

  useSocketException('connection', (data) => {
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
  // 클릭한 지점에 원 생기도록 효과 만들기
  const [clickPosition, setClickPosition] = useState<{ x: number; y: number } | null>(null);

  // 클릭된 위치 기록
  const handleClick = (e: React.MouseEvent) => {
    const { clientX, clientY } = e;
    setClickPosition({ x: clientX, y: clientY });

    setTimeout(() => {
      setClickPosition(null);
    }, 500); // 0.5초 후에 원 사라짐
  };
  return (
    // <div className="bg-gradient-to-r from-sky-100 to-indigo-200 h-[100dvh] flex flex-col overflow-hidden items-center">
    <div className="bg-[url('/retroBg.png')] bg-cover bg-center h-[100dvh] flex flex-col overflow-hidden items-center">
      {/* <div className="w-[150dvh] h-[80dvh]"></div> */}
      {/* <div className="max-w-[1200px] w-full  max-h-[80vh] "> */}
      {/* <HeaderBar /> */}

      <div className="flex-1 overflow-hidden cursor-gameCursor w-full">
        <div className="relative">{clickPosition && <PingEffect position={clickPosition} />}</div>
        <div className="center p-4 pb-0 h-[30%] min-h-[250px]">
          {gameState === GameState.WAIT ? <GameHeader /> : <QuizHeader />}
        </div>
        <div className="grid grid-cols-4 grid-rows-1 gap-4 h-[70%] p-4">
          <div className="hidden lg:block lg:col-span-1">
            <Chat />
          </div>

          <div className="col-span-4 lg:col-span-2" onClick={handleClick}>
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

          <KickModal />
        </div>
      </div>
      {/* </div> */}
    </div>
  );
};
