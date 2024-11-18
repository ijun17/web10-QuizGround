import Lottie from 'lottie-react';
import starBg from '../assets/lottie/star_bg.json';
import { usePlayerStore } from '@/store/usePlayerStore';

type GameResultModalProps = {
  isOpen: boolean;
  onClose: () => void;
  currentPlayerName: string;
};

export const ResultModal: React.FC<GameResultModalProps> = ({
  isOpen,
  onClose,
  currentPlayerName
}) => {
  const players = usePlayerStore((state) => state.players);
  const sortedPlayers = [...players].sort((a, b) => b.playerScore - a.playerScore);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white rounded-lg shadow-xl w-[600px] h-[600px] overflow-hidden">
        <Lottie
          animationData={starBg}
          loop={true}
          autoplay={true}
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="relative flex flex-col items-center justify-between h-full z-10 p-6">
          <h2 className="text-2xl font-bold text-gray-800 text-center">게임이 종료되었습니다.</h2>

          <div className="overflow-y-auto max-h-[300px] w-full bg-white/80 rounded-lg p-4 border border-gray-200 shadow-md">
            {sortedPlayers.map((player, index) => (
              <div
                key={index}
                className={`flex justify-between px-4 py-2 border-b border-gray-100 ${currentPlayerName === player.playerName ? `bg-cyan-100` : null} last:border-none`}
              >
                <span className="text-gray-700 font-medium">
                  <span className="text-blue-700 font-medium">{index + 1}등</span>{' '}
                  {player.playerName}
                </span>
                <span className="text-red-500">{player.playerScore}점</span>
              </div>
            ))}
          </div>

          <div className="flex justify-center mt-4">
            <button
              onClick={onClose}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
