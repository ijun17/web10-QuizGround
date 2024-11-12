import Lottie from 'lottie-react';
import Effect from '../assets/lottie/answer_effect.json';
import Character from '../assets/lottie/character.json';
type Props = {
  name: string;
  position: [number, number];
  isCurrent: boolean;
};

export const Player = ({ name, position, isCurrent }: Props) => {
  const [xPos, yPos] = position;
  const top = xPos * 100 + '%';
  const left = yPos * 100 + '%';
  return (
    <div
      className="absolute transition-all duration-500 ease-in-out"
      style={{ top, left, zIndex: isCurrent ? 3 : 1 }}
      onClick={(e) => e.preventDefault()}
    >
      <div className="flex flex-col items-center justify-center relative">
        <Lottie
          animationData={Effect}
          loop={true}
          autoplay={true}
          style={{
            position: 'absolute',
            top: '-60px', // 캐릭터 위로 60px 위치시킴
            left: '50%',
            transform: 'translateX(-50%)', // 수평 가운데 정렬
            width: '60px',
            height: '60px',
            zIndex: 2 // 이펙트가 캐릭터 위로 올 수 있도록
          }}
        />
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
