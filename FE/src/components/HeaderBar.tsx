import { useNavigate } from 'react-router-dom';

export const HeaderBar = () => {
  const navigate = useNavigate();
  return (
    <header
      className="h-[100px] text-l leading-[100px] pl-8 font-bold bg-white text-main border-b-2 border-main"
      onClick={() => navigate('/')}
    >
      <span className="cursor-pointer">QuizGround</span>
    </header>
  );
};
