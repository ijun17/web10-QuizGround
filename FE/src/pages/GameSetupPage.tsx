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
import { useState } from 'react';
import { socketService } from '../api/socket';

const MAX_PLAYERS = 500;
const MIN_PLAYERS = 2;
const DEFAULT_PLAYERS = 50;

export const GameSetupPage = () => {
  const [roomName, setRoomName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(DEFAULT_PLAYERS);
  const [selectGameMode, setSelectGameMode] = useState('ranking');
  const [roomPublic, setRoomPublic] = useState(true);

  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectGameMode(e.target.value);
  };

  const handleSubmit = async () => {
    const roomData = {
      roomName,
      maxPlayers,
      gameMode: selectGameMode,
      isPublic: roomPublic
    };

    try {
      socketService.createRoom(roomData);
    } catch (error) {
      console.error('Error creating room:', error);
    }
  };

  return (
    <div className="flex flex-col space-y-4">
      <Button variant="outlined" onClick={() => history.back()}>
        {'<'}
      </Button>
      <TextField
        value={roomName}
        label="게임방 제목"
        variant="standard"
        onChange={(e) => setRoomName(e.target.value)}
      />
      <Slider
        min={MIN_PLAYERS}
        max={MAX_PLAYERS}
        step={1}
        value={maxPlayers}
        onChange={(_, newValue) => setMaxPlayers(newValue as number)}
      ></Slider>
      <FormControl component="fieldset">
        <FormLabel component="legend">게임 모드 선택</FormLabel>
        <RadioGroup
          aria-labelledby="game-mode-radio-group"
          value={selectGameMode}
          onChange={handleModeChange}
          name="game-mode-radio-group"
        >
          <FormControlLabel value="survival" control={<Radio />} label="서바이벌" />
          <FormControlLabel value="ranking" control={<Radio />} label="랭킹" />
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
