import { HeaderBar } from '@/components/HeaderBar';
import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const MainPage = () => {
  const navigate = useNavigate();
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
          <Button variant="outlined">대기방 목록</Button>
          <Button variant="outlined">PIN으로 방찾기</Button>
          <Button variant="outlined" onClick={() => navigate('/quiz/setup')}>
            퀴즈 생성
          </Button>
          <Button variant="outlined">로그인</Button>
        </div>
      </div>
    </div>
  );
};
