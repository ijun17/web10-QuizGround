import Chat from '@/features/game/components/Chat';
import ParticipantDisplay from '@/features/game/components/ParticipantDisplay';
import { QuizOptionBoard } from '@/features/game/components/QuizOptionBoard';
import { NicknameModal } from '../components/NicknameModal';
import { useState, useEffect } from 'react';
import { GameHeader } from '@/features/game/components/GameHeader';
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
import RandomBackGround from '@/components/RandomBackGround';
import SnowfallBackground from '../components/SnowfallBackground';
import { backgrounds } from '../data/backgrounds';

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
    setErrorModalTitle(data.split('\n')[0]);
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
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const gameContainer = e.currentTarget.getBoundingClientRect();
    const { clientX, clientY } = e;

    // 상대 좌표 계산
    const relativeX = clientX - gameContainer.left;
    const relativeY = clientY - gameContainer.top;

    setClickPosition({ x: relativeX, y: relativeY });

    setTimeout(() => {
      setClickPosition(null);
    }, 500); // 0.5초 후에 원 사라짐
  };
  const [background, setBackground] = useState<string>(backgrounds[0]);
  const handleBackgroundChange = () => {
    const randomBackground = backgrounds[Math.floor(Math.random() * backgrounds.length)];
    setBackground(randomBackground);
  };

  return (
    <RandomBackGround background={background}>
      <SnowfallBackground />
      <div className="fixed flex-1 cursor-gameCursor w-full h-full max-w-[1400px] max-h-[900px] rounded-3xl min-[1400px]:bg-[#FFFA]">
        <div className="flex flex-col justify-center p-4 pb-0 h-[250px] overflow-hidden z-50">
          {gameState === GameState.WAIT ? (
            <GameHeader onChangeBackground={handleBackgroundChange} />
          ) : (
            <QuizHeader />
          )}
        </div>
        <div className="grid grid-cols-4 grid-rows-1 gap-4 h-[calc(100%-250px)] p-4 z-50">
          <div className="hidden lg:block lg:col-span-1">
            <Chat />
          </div>

          <div className="col-span-4 lg:col-span-2 relative" onClick={handleClick}>
            <QuizOptionBoard />
            {clickPosition && <PingEffect position={clickPosition} />}
          </div>

          <div className="hidden lg:block lg:col-span-1">
            <ParticipantDisplay gameState={gameState} />
          </div>
        </div>
      </div>
      <ResultModal
        isOpen={isResultOpen}
        onClose={handleEndGame}
        currentPlayerName={currentPlayerName}
      />
      <NicknameModal
        isOpen={!currentPlayerName}
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
    </RandomBackGround>
  );
};
