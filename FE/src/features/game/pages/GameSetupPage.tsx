import { Button, Slider, Switch } from '@mui/material';
import { useEffect, useState } from 'react';
import { socketService, useSocketEvent } from '@/api/socket';
import RoomConfig from '@/constants/roomConfig';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '@/features/game/data/store/useRoomStore';
import { usePlayerStore } from '@/features/game/data/store/usePlayerStore';
import { TextInput } from '@/components/TextInput';
export const GameSetupPage = () => {
  const { updateRoom } = useRoomStore((state) => state);
  const setIsHost = usePlayerStore((state) => state.setIsHost);
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [maxPlayerCount, setMaxPlayerCount] = useState<number>(RoomConfig.DEFAULT_PLAYERS);
  const [gameMode, setGameMode] = useState<'SURVIVAL' | 'RANKING'>('RANKING');
  const [roomPublic, setRoomPublic] = useState(true);
  const navigate = useNavigate();

  useSocketEvent('createRoom', (data) => {
    navigate(`/game/${data.gameId}`);
  });

  useEffect(() => {
    socketService.disconnect();
  }, []);

  const handleTitleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setTitle(e.target.value);
    setTitleError('');
  };

  const handleModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value === 'RANKING' ? 'RANKING' : 'SURVIVAL';
    setGameMode(value);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      setTitleError('제목을 입력해 주세요');
      return;
    }
    const roomData = {
      title,
      maxPlayerCount,
      gameMode,
      isPublic: roomPublic
    };
    setIsHost(true);
    updateRoom(roomData);
    socketService.createRoom(roomData);
  };

  return (
    <div className="bg-gradient-to-r from-sky-200 to-indigo-400 min-h-screen flex flex-col items-center justify-center">
      <div className="flex p-6 max-w-screen-xl mx-auto">
        <h1
          className="text-white text-3xl font-bold cursor-pointer transition-all hover:text-purple-500"
          onClick={() => navigate('/')}
        >
          QuizGround
        </h1>
      </div>
      <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-xl border-4 border-blue-400">
        {/* 뒤로가기 버튼 */}
        <div className="mb-6">
          <Button
            variant="outlined"
            onClick={() => navigate('/')}
            className="text-blue-500 border-blue-500 hover:bg-blue-500 hover:text-white transition-all"
          >
            {'<'} 뒤로가기
          </Button>
        </div>

        <TextInput
          value={title}
          label="게임방 제목"
          onChange={handleTitleChange}
          error={titleError}
        />

        <div className="mt-6">
          <span className="text-blue-500">최대 인원</span>
          <div className="flex items-center justify-between mt-2">
            <span className="text-gray-700">{RoomConfig.MIN_PLAYERS}</span>
            <Slider
              min={RoomConfig.MIN_PLAYERS}
              max={RoomConfig.MAX_PLAYERS}
              step={1}
              value={maxPlayerCount}
              onChange={(_, newValue) => setMaxPlayerCount(newValue as number)}
              className="flex-1 mx-4"
              sx={{
                '& .MuiSlider-thumb': {
                  backgroundColor: '#1E40AF' // 파란색 슬라이더 thumb
                }
              }}
            />
            <span className="text-gray-700">{RoomConfig.MAX_PLAYERS}</span>
          </div>
          <div className="flex justify-end items-center mt-2">
            <label htmlFor="max-player-input" className="text-blue-500 font-bold mr-2">
              설정 인원:
            </label>
            <input
              id="max-player-input"
              type="number"
              value={maxPlayerCount}
              onChange={(e) => {
                const value = Number(e.target.value);
                if (value >= RoomConfig.MIN_PLAYERS && value <= RoomConfig.MAX_PLAYERS) {
                  setMaxPlayerCount(value);
                }
              }}
              className="w-16 text-right border border-gray-300 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div className="mt-6">
          <fieldset className="mb-6">
            <legend className="text-blue-500 mb-2">게임 모드 선택</legend>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="SURVIVAL"
                  checked={gameMode === 'SURVIVAL'}
                  onChange={handleModeChange}
                  className="text-blue-500 focus:ring-blue-500"
                />
                서바이벌
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="RANKING"
                  checked={gameMode === 'RANKING'}
                  onChange={handleModeChange}
                  className="text-blue-500 focus:ring-blue-500"
                />
                랭킹
              </label>
            </div>
          </fieldset>
          <fieldset>
            <legend className="text-blue-500 mb-2">방 공개 여부</legend>
            <Switch
              checked={roomPublic}
              onChange={(_, newValue) => setRoomPublic(newValue)}
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: '#1E40AF' // 파란색 스위치
                },
                '& .MuiSwitch-track': {
                  backgroundColor: '#1E40AF'
                }
              }}
            />
          </fieldset>
        </div>

        <div className="mt-6">
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            className="w-full bg-blue-500 text-white hover:bg-blue-600 transition-all"
          >
            방 만들기
          </Button>
        </div>
      </div>
    </div>
  );
};
