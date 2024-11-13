import Lottie from 'lottie-react';
import Effect from '../assets/lottie/answer_effect.json';
import Character from '../assets/lottie/character.json';
import { useEffect, useState } from 'react';
type Props = {
  name: string;
  position: [number, number];
  isCurrent: boolean;
  isAnswer: boolean;
};

export const Player = ({ name, position, isCurrent, isAnswer }: Props) => {
  const [showEffect, setShowEffect] = useState(false);
  const [xPos, yPos] = position;
  const top = xPos * 100 + '%';
  const left = yPos * 100 + '%';

  useEffect(() => {
    if (isAnswer) {
      // console.log(` ${currentPlayer}는 정답자 이므로 이펙트 효과를 on 합니다.`);
      setShowEffect(true);

      const timer = setTimeout(() => {
        setShowEffect(false);
      }, 10000);

      return () => clearTimeout(timer); // 컴포넌트가 언마운트되거나 상태가 변경될 때 타이머 정리
    }
  }, [isAnswer]);

  return (
    <div
      className="absolute transition-all duration-500 ease-in-out"
      style={{ top, left, zIndex: isCurrent ? 3 : 1 }}
      onClick={(e) => e.preventDefault()}
    >
      <div className="flex flex-col items-center justify-center relative">
        {/* 정답시 정답 이펙트 10초 켜졌다가 사라짐 */}
        {showEffect && (
          <Lottie
            animationData={Effect}
            loop={true}
            autoplay={true}
            style={{
              position: 'absolute',
              top: '-60px',
              left: '50%',
              transform: 'translateX(-50%)',
              width: '60px',
              height: '60px',
              zIndex: 2
            }}
          />
        )}
        <Lottie
          animationData={Character}
          loop={true}
          autoplay={true}
          style={{ width: '50px', height: '50px' }}
        />
        <div
          className="mt-2"
          style={{
            color: isCurrent ? 'lightgreen' : 'inherit',
            zIndex: 1 // 텍스트가 이펙트나 캐릭터 아래로 가도록
          }}
        >
          {name}
        </div>
      </div>
    </div>
  );
};
