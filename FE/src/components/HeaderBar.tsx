import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo.tsx';

export const HeaderBar = () => {
  const navigate = useNavigate();
  return (
    <header
      className="h-[100px] text-l leading-[100px] pl-8 font-bold bg-gradient-to-r from-sky-200 to-indigo-400 flex items-center"
      onClick={() => navigate('/')}
    >
      <Logo />
    </header>
  );
};
