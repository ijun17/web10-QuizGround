import { useNavigate } from 'react-router-dom';
import { Logo } from './Logo.tsx';

export const HeaderBar = () => {
  const navigate = useNavigate();
  return (
    <header
      className="h-[80px] text-l leading-[80px] pl-8 font-bold bg-gradient-to-r from-sky-200 to-indigo-400 flex items-center"
      onClick={() => navigate('/')}
    >
      <Logo />
    </header>
  );
};
