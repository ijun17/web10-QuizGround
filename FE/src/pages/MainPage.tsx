import { HeaderBar } from '@/components/HeaderBar';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { socketService } from '@/api/socket';
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
    else navigate('/login');
  };

  return (
    <div>
      <HeaderBar />
      <div className="flex flex-col items-center">
        <img
          className="mt-[10vh] w-[300px] rounded-xl"
          src="https://ideogram.ai/assets/image/lossless/response/xIPIizKgQVi7NXldSE9Xgg"
        />
        <div className="mt-[10vh] flex justify-between w-[100%] lg:w-[600px]">
          <Button variant="outlined" onClick={() => navigate('/game/setup')}>
            게임방 만들기
          </Button>
          <Button variant="outlined" onClick={() => navigate('/game/lobby')}>
            대기방 목록
          </Button>
          <Button variant="outlined" onClick={() => navigate('/pin')}>
            PIN으로 방찾기
          </Button>
          <Button variant="outlined" onClick={handleQuizCreate}>
            퀴즈 생성
          </Button>
          {isLoggedIn ? (
            <Button variant="outlined" onClick={() => navigate('/mypage')}>
              마이페이지
            </Button>
          ) : (
            <Button variant="outlined" onClick={() => navigate('/login')}>
              로그인
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};
