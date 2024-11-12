import Lottie from 'lottie-react';
import Effect from '../assets/lottie/answer_effect.json';
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
      <div className="flex flex-col items-center justify-center">
        <Lottie
          animationData={Effect}
          loop={true}
          autoplay={true}
          style={{ width: '50px', height: '50px' }}
        />
        <div className="mt-2">😀</div>
        <div className="mt-2" style={{ color: isCurrent ? 'lightgreen' : 'inherit' }}>
          {name}
        </div>
      </div>
    </div>
  );
};
