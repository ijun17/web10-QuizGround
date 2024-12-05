import Lottie from 'lottie-react';
import { FC } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimationConfigWithData } from 'lottie-web';
import CustomButton from '@/components/CustomButton';

type CardProps = {
  title: string;
  action?: () => void;
  path?: string;
  icon: AnimationConfigWithData['animationData'];
};

export const InfoCard: FC<CardProps> = ({ title, icon, path, action }) => {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl p-2 shadow-lg border-4 border-blue-200 flex flex-col justify-between hover:scale-105 transition-all duration-300 animate-popup">
      <h3 className="text-xl font-semibold text-blue-600">{title}</h3>
      <Lottie
        animationData={icon}
        loop={true}
        autoplay={true}
        className="mx-auto cursor-gameCursorPointer"
        style={{
          width: '125px',
          height: '125px'
        }}
      />
      <CustomButton
        text={title}
        className="w-full"
        onClick={() => {
          if (action) action();
          if (path) navigate(path);
        }}
      />
    </div>
  );
};
