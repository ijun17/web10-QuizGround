import { Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';

export const MainPage = () => {
  const navigate = useNavigate();
  return (
    <div className="flex space-x-2">
      <Button variant="outlined" onClick={() => navigate('/game/setup')}>
        게임방 만들기
      </Button>
      <Button variant="outlined">대기방 목록</Button>
      <Button variant="outlined">PIN으로 방찾기</Button>
      <Button variant="outlined">로그인</Button>
    </div>
  );
};
