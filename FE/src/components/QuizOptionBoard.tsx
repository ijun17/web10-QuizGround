import { usePlayerStore } from '@/store/usePlayerStore';
import { Player } from './Player';
import { socketService } from '@/api/socket';
import { useRoomStore } from '@/store/useRoomStore';
import { useState } from 'react';
import { useQuizeStore } from '@/store/useQuizStore';

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

const mockQuiz = {
  quiz: '이것은 목데이터 퀴즈입니다.',
  choiceList: [
    { content: '옵션 1', order: 1 },
    { content: '옵션 2', order: 2 },
    { content: '옵션 3', order: 3 },
    { content: '옵션 4', order: 4 }
  ],
  endTime: Date.now() + 10000 // 10초 후 종료
};

export const QuizOptionBoard = () => {
  const currentPlayerId = usePlayerStore((state) => state.currentPlayerId);
  const gameId = useRoomStore((state) => state.gameId);
  const players = usePlayerStore((state) => state.players);
  // const options = useQuizeStore((state) => state.currentQuiz?.choiceList) || [];
  const options = useQuizeStore((state) => state.currentQuiz?.choiceList) || mockQuiz.choiceList;
  const [selectedOption, setSelectedOption] = useState(options.length);

  const handleClick: React.MouseEventHandler<HTMLDivElement> = (e) => {
    const { pageX, pageY } = e;
    const { width, height, top, left } = e.currentTarget.getBoundingClientRect();
    const x = (pageX - left) / width;
    const y = (pageY - top) / height;
    if (x > 1 || y > 1) return;
    socketService.emit('updatePosition', { gameId, newPosition: [y, x] });
    const option = Math.round(x) + Math.floor(y * Math.ceil(options.length / 2)) * 2;
    setSelectedOption(option);
  };

  return (
    <div className="relative component-default h-[100%]" onClick={handleClick}>
      <div className="absolute h-[100%] w-[100%]">
        {players.map((player) => (
          <Player
            key={player.playerId}
            name={player.playerName}
            position={player.playerPosition}
            isCurrent={player.playerId === currentPlayerId}
          />
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 p-4 h-[100%] w-[100%]">
        {options.map((option, i) => (
          <div
            className="rounded-lg flex justify-center items-center w-[100%] h-[100%]"
            key={i}
            style={{
              background: optionColors[i],
              border: 'solid 3px ' + (i === selectedOption ? 'lightgreen' : 'white')
            }}
          >
            {i + 1 + '. ' + option.content}
          </div>
        ))}
      </div>
    </div>
  );
};
