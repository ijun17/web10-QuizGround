import { socketService, useSocketEvent } from '@/api/socket';
import { HeaderBar } from '@/components/HeaderBar';
import { TextInput } from '@/components/TextInput';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PinPage = () => {
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState({ nickname: '', pin: '' });
  const navigate = useNavigate();

  useSocketEvent('joinRoom', () => {
    navigate(`/game/${pin}`);
  });

  const handleJoin = () => {
    const newErrors = { nickname: '', pin: '' };
    let hasError = false;

    if (!pin.trim()) {
      newErrors.pin = '핀번호를 입력해주세요';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    socketService.joinRoom(pin);
  };

  return (
    <>
      <HeaderBar />
      <div className="flex items-center justify-center h-[calc(100vh-100px)] bg-surface-alt">
        <div className="component-default max-w-[90vw] w-[40rem] p-10 flex flex-col gap-5">
          <h1>방 들어가기</h1>

          <TextInput
            label="핀번호"
            value={pin}
            onChange={(e) => {
              setPin(e.target.value);
              if (errors.pin) setErrors((prev) => ({ ...prev, pin: '' }));
            }}
            error={errors.pin}
          />

          <button
            className="h-10 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg active:bg-blue-700 active:shadow-sm transition-all duration-300 ease-in-out"
            onClick={handleJoin}
          >
            들어가기
          </button>
        </div>
      </div>
    </>
  );
};
