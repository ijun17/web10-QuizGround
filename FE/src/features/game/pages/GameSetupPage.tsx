import { Slider, Switch } from '@mui/material';
import { useState } from 'react';
import { socketService, useSocketEvent, useSocketException } from '@/api/socket';
import RoomConfig from '@/constants/roomConfig';
import { useNavigate } from 'react-router-dom';
import { useRoomStore } from '@/features/game/data/store/useRoomStore';
import { TextInput } from '@/components/TextInput';
import { Header } from '@/components/Header';
import CustomButton from '../../../components/CustomButton';

export const GameSetupPage = () => {
  const { updateRoom } = useRoomStore((state) => state);
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [maxPlayerCount, setMaxPlayerCount] = useState<number>(RoomConfig.DEFAULT_PLAYERS);
  const [gameMode, setGameMode] = useState<'SURVIVAL' | 'RANKING'>('RANKING');
  const [roomPublic, setRoomPublic] = useState(true);
  const navigate = useNavigate();

  useSocketEvent('createRoom', (data) => {
    navigate(`/game/${data.gameId}`);
  });

  useSocketException('connection', (data) => {
    alert(data);
  });

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
    updateRoom(roomData);
    socketService.createRoom(roomData);
  };

  return (
    <>
      <div className="bg-gradient-to-r from-blue-300 to-indigo-500 min-h-screen flex flex-col items-center justify-center">
        <Header />
        <div className="p-4 max-w-full mx-auto bg-white shadow-lg rounded-lg w-full sm:w-4/5 md:w-3/5 lg:w-2/5 mt-6">
          <h2 className="text-2xl font-bold text-center text-blue-500 mb-6">게임방 만들기</h2>

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
              <div className="flex flex-col gap-4">
                <div>
                  <label className="gap-2 font-bold inline">
                    <input
                      type="radio"
                      value="SURVIVAL"
                      checked={gameMode === 'SURVIVAL'}
                      onChange={handleModeChange}
                      className="text-blue-500 focus:ring-blue-500 mr-2"
                    />
                    서바이벌
                  </label>
                  <span className="ml-4">퀴즈를 틀리면 탈락합니다.</span>
                </div>
                <div>
                  <label className="gap-2 font-bold inline">
                    <input
                      type="radio"
                      value="RANKING"
                      checked={gameMode === 'RANKING'}
                      onChange={handleModeChange}
                      className="text-blue-500 focus:ring-blue-500 mr-2"
                    />
                    랭킹모드
                  </label>
                  <span className="ml-4">점수를 종합해 마지막에 순위를 발표합니다</span>
                </div>
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
            <CustomButton text="방 만들기" onClick={handleSubmit} />
          </div>
        </div>
      </div>
    </>
  );
};
