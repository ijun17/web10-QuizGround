import { useNavigate } from 'react-router-dom';

const color = 'text-blue-800';
const shadowStyle = '-2px 0 white, 0 2px white, 2px 0 white, 0 -2px white';
// const shadowStyle = '4px 4px #558ABB';

export const Logo = () => {
  const navigate = useNavigate();
  return (
    <span style={{ textShadow: shadowStyle }} onClick={() => navigate('/')}>
      <span
        className={`font-logo ${color} text-3xl hover:text-blue-400 transition-all cursor-gameCursorPointer`}
      >
        QuizGround
      </span>
    </span>
  );
};
