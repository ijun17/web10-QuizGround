import {
  Button,
  Slider,
  Switch,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  TextField
} from '@mui/material';
import { useEffect, useState } from 'react';
import { socketService } from '@/api/socket';
import RoomConfig from '@/constants/roomConfig';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '@/store/useRoomStore';
export const GameSetupPage = () => {
  const gameId = useRoomStore((state) => state.gameId);
  const [title, setTitle] = useState('');
  const [maxPlayerCount, setMaxPlayerCount] = useState<number>(RoomConfig.DEFAULT_PLAYERS);
  const [gameMode, setGameMode] = useState<'SURVIVAL' | 'RANKING'>('RANKING');
  const [roomPublic, setRoomPublic] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (gameId) navigate(`/game/${gameId}`);
  }, [gameId, navigate]);

  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === 'RANKING' ? 'RANKING' : 'SURVIVAL';
    setGameMode(value);
  };

  const handleSubmit = async () => {
    const roomData = {
      title,
      maxPlayerCount,
      gameMode,
      isPublic: roomPublic
    };
    socketService.createRoom(roomData);
  };

  return (
    <div className="flex flex-col space-y-4">
      <Button variant="outlined" onClick={() => history.back()}>
        {'<'}
      </Button>
      <TextField
        value={title}
        label="게임방 제목"
        variant="standard"
        onChange={(e) => setTitle(e.target.value)}
      />
      <Slider
        min={RoomConfig.MIN_PLAYERS}
        max={RoomConfig.MAX_PLAYERS}
        step={1}
        value={maxPlayerCount}
        onChange={(_, newValue) => setMaxPlayerCount(newValue as number)}
      ></Slider>
      <FormControl component="fieldset">
        <FormLabel component="legend">게임 모드 선택</FormLabel>
        <RadioGroup
          aria-labelledby="game-mode-radio-group"
          value={gameMode}
          onChange={handleModeChange}
          name="game-mode-radio-group"
        >
          <FormControlLabel value="SURVIVAL" control={<Radio />} label="서바이벌" />
          <FormControlLabel value="RANKING" control={<Radio />} label="랭킹" />
        </RadioGroup>
      </FormControl>
      <FormControl component="fieldset">
        <FormLabel component="legend">방 공개 여부</FormLabel>
        <Switch
          checked={roomPublic}
          onChange={(_, newValue) => setRoomPublic(newValue)}
          defaultChecked
        />
      </FormControl>
      <Button variant="contained" color="primary" onClick={handleSubmit}>
        방 만들기
      </Button>
    </div>
  );
};
