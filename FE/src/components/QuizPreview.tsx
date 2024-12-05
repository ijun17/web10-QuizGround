import Lottie from 'lottie-react';
import snowMan from '../../src/assets/lottie/snowMan.json';
type Props = {
  title: string;
  description: string;
};

export const QuizPreview = ({ title, description }: Props) => {
  return (
    <div className="component-default flex items-center gap-4 p-4 rounded-lg shadow-lg bg-white">
      <div className="flex-shrink-0 w-[100px] h-[80px] overflow-hidden rounded-md shadow-md">
        <Lottie animationData={snowMan} loop={true} className="w-full h-full object-cover" />
        {/* <img src={sampleQuizImage} alt={title} className="w-full h-full object-cover" /> */}
      </div>

      <div className="flex flex-col justify-center flex-grow">
        <h3 className="text-lg font-bold text-gray-800 truncate">{title}</h3>
        <p className="text-sm text-gray-600 line-clamp-2">{description}</p>
      </div>
    </div>
  );
};
