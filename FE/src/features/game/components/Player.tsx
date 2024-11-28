import { useEffect, useRef, useState } from 'react';
import AnswerEffect from '@/assets/lottie/answer_effect.json';
import FailEffect from '@/assets/lottie/fail_effect2.json';
import Character from '@/assets/lottie/character3.json';
import QuizState from '@/constants/quizState';
import { useQuizStore } from '@/features/game/data/store/useQuizStore';
import lottie from 'lottie-web';
import { usePlayerStore } from '../data/store/usePlayerStore';
import { useRoomStore } from '../data/store/useRoomStore';

type Props = {
  playerId: string;
  boardSize: [number, number];
  isCurrent: boolean;
};

export const Player = ({ playerId, boardSize, isCurrent }: Props) => {
  const gameState = useRoomStore((state) => state.gameState);
  const [showEffect, setShowEffect] = useState(false);
  const [effectData, setEffectData] = useState(AnswerEffect);
  const quizState = useQuizStore((state) => state.quizState);
  const player = usePlayerStore((state) => state.players.get(playerId));
  // const playerCount = usePlayerStore((state) => state.players.size);

  // Lottie 요소를 렌더링할 DOM 요소에 대한 참조
  const effectRef = useRef(null);
  const characterRef = useRef(null);

  useEffect(() => {
    if (quizState === QuizState.END && player && gameState === 'PROGRESS' && player.isAnswer) {
      setEffectData(player.isAnswer ? AnswerEffect : FailEffect);
      setShowEffect(true);
    }
  }, [quizState, player, gameState]);

  // 효과가 끝난 후 5초 뒤에 효과 숨기기
  useEffect(() => {
    if (showEffect && effectRef.current) {
      const animation = lottie.loadAnimation({
        container: effectRef.current,
        renderer: 'canvas',
        loop: true,
        autoplay: true,
        animationData: effectData
      });

      const timer = setTimeout(() => {
        setShowEffect(false);
        animation.stop();
      }, 5000);

      return () => {
        animation.destroy();
        clearTimeout(timer);
      };
    }
  }, [showEffect, effectData]);

  useEffect(() => {
    if (characterRef.current) {
      const characterAnimation = lottie.loadAnimation({
        container: characterRef.current,
        renderer: 'canvas',
        loop: true,
        autoplay: true,
        animationData: Character
      });

      return () => {
        characterAnimation.destroy();
      };
    }
  }, []);

  if (!player) return null;

  const [xPos, yPos] = [
    player.playerPosition[1] * boardSize[0],
    player.playerPosition[0] * boardSize[1]
  ];

  // const playerSize = playerCount < 50 ? 1 : playerCount < 120 ? 0.9 : 0.8;
  const playerSize = boardSize[0] + boardSize[1] > 1000 ? 1 : 0.8;

  return (
    <div
      className="absolute transition-transform duration-500 ease-in-out will-change-transform"
      style={{
        transform: `translate(calc(${xPos}px - 50%), calc(${yPos}px - 50%)) scale(${playerSize})`,
        zIndex: isCurrent ? 3 : 1,
        opacity: player.isAlive ? '1' : '0.3'
      }}
      onClick={(e) => e.preventDefault()}
    >
      <div
        className="flex flex-col items-center justify-center relative transition-all duration-[4000ms]"
        style={{
          transform: quizState === 'end' && !player.isAnswer ? 'translateY(-60px)' : 'none',
          opacity: quizState === 'end' && !player.isAnswer ? '0' : '1'
        }}
      >
        {/* 정답 시 정답 이펙트 5초 켜졌다가 사라짐 */}
        {showEffect && (
          <div
            ref={effectRef}
            style={{
              position: 'absolute',
              top: '-30px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '30px',
              height: '30px',
              zIndex: 2
            }}
          />
        )}
        <div className="text-2xl z-[2]">
          {quizState === 'end' && !player.isAnswer ? '👻' : player.emoji}
        </div>
        <div
          className="mt-2 text-[0.625rem]"
          style={{
            color: isCurrent ? 'lightgreen' : 'inherit',
            opacity: isCurrent ? '1' : '0.2'
          }}
        >
          {player.playerName}
        </div>
      </div>
    </div>
  );
};
