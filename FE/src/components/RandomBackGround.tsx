import { ReactNode } from 'react';

type RandomBackgroundProps = {
  children: ReactNode | ReactNode[];
  background: string;
};

const RandomBackGround: React.FC<RandomBackgroundProps> = ({ children, background }) => {
  return (
    <div
      className={`fixed w-full h-full flex flex-col overflow-hidden items-center justify-center ${background}`}
    >
      {children}
    </div>
  );
};

export default RandomBackGround;
