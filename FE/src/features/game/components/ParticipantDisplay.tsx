import { socketService } from '@/api/socket';
import GameState from '@/constants/gameState';
import { usePlayerStore } from '@/features/game/data/store/usePlayerStore';
import { useRoomStore } from '@/features/game/data/store/useRoomStore';
import { motion } from 'framer-motion';
import { useCallback, useMemo } from 'react';

type ParticipantDisplayProps = {
  gameState: keyof typeof GameState;
};

const ParticipantDisplay: React.FC<ParticipantDisplayProps> = ({ gameState }) => {
  const players = usePlayerStore((state) => state.players);
  const maxPlayerCount = useRoomStore((state) => state.maxPlayerCount);
  const currentPlayerId = usePlayerStore((state) => state.currentPlayerId);
  const isHost = usePlayerStore((state) => state.isHost);
  const gameMode = useRoomStore((state) => state.gameMode);
  const gameId = useRoomStore((state) => state.gameId);

  const handleKick = useCallback(
    (playerId: string) => {
      socketService.kickRoom(gameId, playerId);
    },
    [gameId]
  );

  // 대기 모드일 때 참가자 목록 표시
  const renderWaitingMode = useCallback(
    () => (
      <div className="p-3 h-[calc(100%-2.5rem)] overflow-y-scroll">
        {Array.from(players).map(([, player]) => (
          <div
            className="flex justify-between mt-2 pb-2 border-b border-default"
            key={player.playerId}
          >
            <div>{player.emoji + ' ' + player.playerName}</div>
            {isHost && currentPlayerId !== player.playerId && (
              <button
                className="bg-blue-500 rounded-lg text-white w-8 h-6 text-r active:scale-90 hover:bg-red-500"
                onClick={() => handleKick(player.playerId)}
              >
                강퇴
              </button>
            )}
          </div>
        ))}
      </div>
    ),
    [players, currentPlayerId, handleKick, isHost]
  );

  // 진행 모드일 때 랭킹 현황 표시
  const renderProgressRankingMode = useCallback(
    () => (
      <div className="p-3 h-[calc(100%-2.5rem)] overflow-y-scroll">
        {Array.from(players)
          .sort(([, a], [, b]) => b.playerScore - a.playerScore) // 점수 내림차순
          .map(([, player]) => (
            <motion.div
              className="flex justify-between mt-2 pb-2 border-b border-default"
              key={player.playerId}
              layout
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <div>{player.emoji + ' ' + player.playerName}</div>
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
    ),
    [players]
  );

  // 진행 모드일 때 생존자 표시
  const renderProgressSurvivalMode = useCallback(
    () => (
      <div className="p-3 h-[calc(100%-2.5rem)] overflow-y-scroll">
        {Array.from(players)
          .filter(([, player]) => player.isAlive)
          .map(([, player]) => (
            <motion.div
              className="flex justify-between mt-2 pb-2 border-b border-default"
              key={player.playerId}
              layout
              transition={{ type: 'spring', stiffness: 100, damping: 20 }}
            >
              <div style={{ color: player.isAnswer ? 'inherit' : 'red' }}>
                {player.emoji + ' ' + player.playerName}
              </div>
            </motion.div>
          ))}
      </div>
    ),
    [players]
  );

  const playerList = useMemo(
    () =>
      gameState === GameState.WAIT
        ? renderWaitingMode()
        : gameMode === 'SURVIVAL'
          ? renderProgressSurvivalMode()
          : renderProgressRankingMode(),
    [gameState, gameMode, renderProgressRankingMode, renderProgressSurvivalMode, renderWaitingMode]
  );

  return (
    <div className="component-default h-[100%]">
      <div className="border-b border-default center h-[2.5rem]">
        {gameState === GameState.WAIT
          ? `참가자 [${players.size}/${maxPlayerCount}]`
          : gameMode === 'SURVIVAL'
            ? '생존자'
            : `랭킹 현황`}
      </div>
      {playerList}
    </div>
  );
};

export default ParticipantDisplay;
