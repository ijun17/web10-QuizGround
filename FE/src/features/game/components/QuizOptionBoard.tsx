import { usePlayerStore } from '@/features/game/data/store/usePlayerStore';
import { useRoomStore } from '@/features/game/data/store/useRoomStore';
import { useQuizStore } from '@/features/game/data/store/useQuizStore';
import { Player } from './Player';
import { socketService } from '@/api/socket';
import { useEffect, useRef, useState } from 'react';
import { getServerTimestamp } from '@/features/game/utils/serverTime';

const optionColors = [
  '#FF9AA2', // pastel red
  '#FFB3BA', // pastel pink
  '#FFDAC1', // pastel peach
  '#FFE156', // pastel yellow
  '#E2F0CB', // pastel green
  '#B5EAD7', // pastel mint
  '#C7CEEA', // pastel blue
  '#A0C4FF', // pastel light blue
  '#B9D8FF', // pastel lavender
  '#C3B3E0' // pastel purple
];

export const QuizOptionBoard = () => {
  const currentPlayerId = usePlayerStore((state) => state.currentPlayerId);
  const gameId = useRoomStore((state) => state.gameId);
  const players = usePlayerStore((state) => state.players);
  const currentQuiz = useQuizStore((state) => state.currentQuiz);
  const choiceList = currentQuiz?.choiceList || [];
  const quizState = useQuizStore((state) => state.quizState);
  const quizAnswer = useQuizStore((state) => state.currentAnswer);
  const [selectedOption, setSelectedOption] = useState(currentQuiz?.choiceList.length);
  const [choiceListVisible, setChoiceListVisible] = useState(false);

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const { pageX, pageY } = e;
    const { width, height, top, left } = e.currentTarget.getBoundingClientRect();
    const x = (pageX - left - window.scrollX) / width;
    const y = (pageY - top - window.scrollY) / height;
    if (x > 1 || y > 1) return;
    socketService.emit('updatePosition', { gameId, newPosition: [y, x] });
    const option = Math.round(x) + Math.floor(y * Math.ceil(choiceList.length / 2)) * 2;
    setSelectedOption(option);
  };

  const boardRef = useRef<HTMLDivElement | null>(null);
  const [boardRect, setBoardRect] = useState<null | DOMRect>(null);

  // 보드 크기 초기화
  useEffect(() => {
    if (boardRef.current) {
      setBoardRect(boardRef.current.getBoundingClientRect());
    }
  }, []);

  // 화면 변화에 따라 보드 크기 재조정
  useEffect(() => {
    const handleResize = () => {
      if (boardRef.current) setBoardRect(boardRef.current.getBoundingClientRect());
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [boardRef]);

  // 퀴즈 시작 시간에 선택지 렌더링
  useEffect(() => {
    const interval = setInterval(() => {
      if (!choiceListVisible && currentQuiz && currentQuiz.startTime <= getServerTimestamp())
        setChoiceListVisible(true);
      else if (choiceListVisible && currentQuiz && currentQuiz.startTime > getServerTimestamp())
        setChoiceListVisible(false);
    }, 100);
    return () => clearInterval(interval);
  }, [choiceListVisible, currentQuiz]);

  return (
    <div
      className="relative component-default h-[100%] select-none"
      onClick={handleClick}
      ref={boardRef}
    >
      <div className="absolute h-[100%] w-[100%]">
        {boardRect
          ? players
              .filter((player) => player.isAlive || player.playerId === currentPlayerId)
              .map((player) => {
                return (
                  <Player
                    key={player.playerId}
                    name={player.playerName}
                    position={[
                      player.playerPosition[1] * boardRect.width,
                      player.playerPosition[0] * boardRect.height
                    ]}
                    isCurrent={player.playerId === currentPlayerId}
                    isAnswer={player.isAnswer ?? false}
                    isAlive={player.isAlive}
                  />
                );
              })
          : null}
      </div>
      <div className="grid grid-cols-2 gap-4 p-4 h-[100%] w-[100%]">
        {choiceListVisible &&
          choiceList.map((option, i) => (
            <div
              className={'rounded-lg flex justify-center items-center w-[100%] h-[100%]'}
              key={i}
              style={{
                background: optionColors[i],
                border: 'solid 3px ' + (i === selectedOption ? 'lightgreen' : 'white'),
                boxShadow:
                  quizState === 'end' && option.order == quizAnswer
                    ? `
      0 0 10px rgba(255, 215, 0, 0.8), 
      0 0 20px rgba(255, 223, 0, 0.6), 
      0 0 30px rgba(255, 223, 0, 0.5), 
      0 0 40px rgba(255, 215, 0, 0.4)`
                    : 'none',
                opacity: quizState === 'end' && option.order != quizAnswer ? '0.3' : '1',
                textShadow: '-1px 0 white, 0 1px white, 1px 0 white, 0 -1px white'
              }}
            >
              <div className="z-10 font-bold text-lg text-black">
                {i + 1 + '. ' + option.content}
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};
