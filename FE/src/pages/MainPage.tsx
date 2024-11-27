// import { HeaderBar } from '@/components/HeaderBar';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect, FC } from 'react';
import { socketService } from '@/api/socket';
import Lottie from 'lottie-react';
import mainCube from '../assets/lottie/mainLottie.json';
import { InfoCard } from './InfoCard';

export const MainPage = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

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
    if (isLoggedIn) navigate('/quiz/setup');
    else {
      alert('로그인이 필요한 서비스 입니다.');
      navigate('/login');
    }
  };

  type ActionButtonProps = {
    label: string;
    navigatePath: string;
  };

  const ActionButton: FC<ActionButtonProps> = ({ label, navigatePath }) => {
    return (
      <div
        className="text-white px-6 py-3 rounded-md bg-indigo-500 hover:bg-indigo-600 cursor-pointer transition-all duration-300"
        onClick={() => navigate(navigatePath)}
      >
        {label}
      </div>
    );
  };
  return (
    <div className="bg-gradient-to-r from-sky-200 to-indigo-400 min-h-screen">
      <div className="flex justify-between items-center p-6 max-w-screen-xl mx-auto">
        <h1 className="text-white text-3xl font-bold ">QuizGround</h1>
        <div>
          <ActionButton
            label={isLoggedIn ? '마이페이지' : '로그인'}
            navigatePath={isLoggedIn ? '/mypage' : '/login'}
          />
        </div>
      </div>

      {/*소개 및 카드 섹션 */}
      <div className="mt-6 mb-6 px-4 sm:px-6 max-w-screen-xl mx-auto rounded-xl border-4 border-white py-10 flex flex-col items-center space-y-12 h-[calc(100vh-150px)] overflow-auto">
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
              description={card.description}
              path={card.path}
              action={card.action === 'handleQuizCreate' ? handleQuizCreate : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const cardData = [
  {
    title: '게임방 만들기',
    description: '새로운 퀴즈 방을 만들고 친구들과 함께 퀴즈를 풀어보세요.',
    path: '/game/setup'
  },
  {
    title: '대기방 목록',
    description: '현재 대기 중인 방 목록을 확인하고 대기실로 입장하세요.',
    path: '/game/lobby'
  },
  {
    title: 'PIN으로 방 찾기',
    description: '특정 PIN 번호로 방을 찾아서 바로 입장하세요.',
    path: '/pin'
  },
  {
    title: '퀴즈 생성',
    description: '퀴즈를 만들어 친구들과 함께 즐겨보세요.',
    action: 'handleQuizCreate' // Navigate 대신 특정 핸들러 호출
  }
];
