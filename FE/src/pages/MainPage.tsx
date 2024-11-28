// import { HeaderBar } from '@/components/HeaderBar';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, FC } from 'react';
import { socketService } from '@/api/socket';
import Lottie from 'lottie-react';
import mainCube from '../assets/lottie/mainLottie.json';
import { InfoCard } from './InfoCard';
import { gameCreate, waitRoom, pin, createQuiz } from '../assets/lottie';
import { LoginModal } from '@/features/auth/LoginModal';
import { Logo } from '@/components/Logo';
export const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isOpenLoginModal, setIsOpenLoginModal] = useState(false);

  useEffect(() => {
    socketService.disconnect();
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleQuizCreate = () => {
    // dev Mode
    navigate('/quiz/setup');
    // if (isLoggedIn) navigate('/quiz/setup');
    // else {
    //   alert('로그인이 필요한 서비스 입니다.');
    //   navigate('/login');
    // }
  };

  type ActionButtonProps = {
    label: string;
    navigatePath: string;
  };

  const ActionButton: FC<ActionButtonProps> = ({ label, navigatePath }) => {
    return (
      <button
        className="text-white px-6 py-3 rounded-md bg-indigo-500 hover:bg-indigo-600 transition-all duration-300"
        onClick={() => navigate(navigatePath)}
      >
        {label}
      </button>
    );
  };
  return (
    <div className="bg-gradient-to-r from-sky-200 to-indigo-400 min-h-screen pb-4">
      <div className="flex justify-between items-center max-w-screen-xl mx-auto p-4">
        <Logo />

        <div>
          {isLoggedIn ? (
            <ActionButton label="마이페이지" navigatePath="/mypage" />
          ) : (
            <button
              className="text-white px-6 py-3 rounded-md bg-indigo-500 hover:bg-indigo-600 transition-all duration-300"
              onClick={() => setIsOpenLoginModal(true)}
            >
              로그인
            </button>
          )}
        </div>
      </div>

      {/*소개 및 카드 섹션 */}
      <div className="mt-6 px-4 sm:px-6 max-w-screen-xl w-[95vw] mx-auto rounded-xl border-4 border-white py-10 flex flex-col items-center space-y-12">
        <div className="flex flex-wrap justify-between w-full px-4 sm:px-6">
          <div className="w-full md:w-1/2 text-center text-blue-900 flex flex-col justify-center">
            <h2 className="text-2xl font-bold">퀴즈 게임을 시작해보세요!</h2>
            <p className="mt-2 text-lg">
              다양한 퀴즈와 함께 즐겁게 학습하고, 친구들과 경쟁해보세요.
              <br />
              지금 바로 퀴즈를 만들어보세요!
            </p>
          </div>
          <div className="w-full md:w-1/3 h-[250px] sm:h-[300px] lg:h-[350px] xl:h-[400px] max-w-[400px] mx-auto">
            <Lottie
              animationData={mainCube}
              loop={true}
              autoplay={true}
              className="w-full h-full"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full px-4 sm:px-6">
          {cardData.map((card, index) => (
            <InfoCard
              key={index}
              title={card.title}
              icon={card.icon}
              path={card.path}
              action={card.action === 'handleQuizCreate' ? handleQuizCreate : undefined}
            />
          ))}
        </div>
      </div>
      <LoginModal isOpen={isOpenLoginModal} onClose={() => setIsOpenLoginModal(false)} />
    </div>
  );
};

const cardData = [
  {
    title: '게임방 만들기',
    icon: gameCreate,
    path: '/game/setup'
  },
  {
    title: '대기방 목록',
    icon: waitRoom,
    path: '/game/lobby'
  },
  {
    title: 'PIN으로 방 찾기',
    icon: pin,
    path: '/pin'
  },
  {
    title: '퀴즈 생성 하기',
    icon: createQuiz,
    action: 'handleQuizCreate' // Navigate 대신 특정 핸들러 호출
  }
];
