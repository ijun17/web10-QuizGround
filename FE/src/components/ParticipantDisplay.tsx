import GameState from '@/constants/gameState';
import { usePlayerStore } from '@/store/usePlayerStore';
import { useRoomStore } from '@/store/useRoomStore';
import { motion } from 'framer-motion';

type ParticipantDisplayProps = {
  gameState: keyof typeof GameState;
};

const ParticipantDisplay: React.FC<ParticipantDisplayProps> = ({ gameState }) => {
  const players = usePlayerStore((state) => state.players);
  const playerCount = usePlayerStore((state) => state.players.length);
  const maxPlayerCount = useRoomStore((state) => state.maxPlayerCount);
  const currentPlayerId = usePlayerStore((state) => state.currentPlayerId);
  const isHost = usePlayerStore((state) => state.isHost);
  // 대기 모드일 때 참가자 목록 표시
  const renderWaitingMode = () => (
    <div className="p-3 h-[calc(100%-2.5rem)] overflow-y-scroll">
      {players.map((player, i) => (
        <div
          className="flex justify-between mt-2 pb-2 border-b border-default"
          key={player.playerId}
        >
          <div>{i + 1 + '. ' + player.playerName}</div>
          {isHost && currentPlayerId !== player.playerId && (
            <button className="bg-main rounded-lg text-white w-8 h-6 text-r">강퇴</button>
          )}
        </div>
      ))}
    </div>
  );

  // 진행 모드일 때 랭킹 현황 표시
  const renderProgressMode = () => (
    <div className="p-3 h-[calc(100%-2.5rem)] overflow-y-scroll">
      {players
        .sort((a, b) => b.playerScore - a.playerScore) // 점수 내림차순
        .map((player, i) => (
          <motion.div
            className="flex justify-between mt-2 pb-2 border-b border-default"
            key={player.playerId}
            layout
            transition={{ type: 'spring', stiffness: 100, damping: 20 }}
          >
            <div>{i + 1 + '. ' + player.playerName}</div>
            <motion.div
              initial={{ scale: 1 }}
              animate={{ scale: 1.1 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
            >
              <motion.span
                key={player.playerId + player.playerScore}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {player.playerScore}
              </motion.span>
            </motion.div>
          </motion.div>
        ))}
    </div>
  );

  return (
    <div className="component-default h-[100%]">
      <div className="border-b border-default center h-[2.5rem]">
        {gameState === GameState.WAIT ? `참가자 [${playerCount}/${maxPlayerCount}]` : `랭킹 현황`}
      </div>
      {gameState === GameState.WAIT ? renderWaitingMode() : renderProgressMode()}
    </div>
  );
};

export default ParticipantDisplay;
