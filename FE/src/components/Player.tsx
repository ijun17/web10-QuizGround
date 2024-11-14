import { useEffect, useRef, useState } from 'react';
import AnswerEffect from '../assets/lottie/answer_effect.json';
import FailEffect from '../assets/lottie/fail_effect2.json';
import Character from '../assets/lottie/character3.json';
import QuizState from '@/constants/quizState';
import { useQuizeStore } from '@/store/useQuizStore';

import lottie from 'lottie-web';

type Props = {
  name: string;
  position: [number, number];
  isCurrent: boolean;
  isAnswer: boolean;
};

export const Player = ({ name, position, isCurrent, isAnswer }: Props) => {
  const [showEffect, setShowEffect] = useState(false);
  const [effectData, setEffectData] = useState(AnswerEffect);
  const quizState = useQuizeStore((state) => state.quizState);
  const [xPos, yPos] = position;

  // Lottie 요소를 렌더링할 DOM 요소에 대한 참조
  const effectRef = useRef(null);
  const characterRef = useRef(null);

  useEffect(() => {
    if (quizState === QuizState.END) {
      setEffectData(isAnswer ? AnswerEffect : FailEffect);
      setShowEffect(true);
    }
  }, [quizState, isAnswer]);

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

  return (
    <div
      className="absolute transition-all duration-500 ease-in-out"
      style={{ transform: `translate(${xPos}px, ${yPos}px)`, zIndex: isCurrent ? 3 : 1 }}
      onClick={(e) => e.preventDefault()}
    >
      <div className="flex flex-col items-center justify-center relative">
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
        {/* <div ref={characterRef} style={{ width: '40px', height: '40px' }} /> */}
        <div>{quizState === 'end' && !isAnswer ? '😭' : '😃'}</div>
        <div
          className="mt-2 text-[0.625rem]"
          style={{
            color: isCurrent ? 'lightgreen' : 'inherit',
            zIndex: 1
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
};
