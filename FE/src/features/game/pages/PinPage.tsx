import { socketService } from '@/api/socket';
// import { HeaderBar } from '@/components/HeaderBar';
import { TextInput } from '@/components/TextInput';
import { getRandomNickname } from '@/features/game/utils/nickname';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const PinPage = () => {
  const [nickname, setNickname] = useState('');
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState({ nickname: '', pin: '' });

  const navigate = useNavigate();

  useEffect(() => {
    setNickname(getRandomNickname());
  }, []);

  const handleJoin = () => {
    const newErrors = { nickname: '', pin: '' };
    let hasError = false;

    if (!nickname.trim()) {
      newErrors.nickname = '닉네임을 입력해주세요';
      hasError = true;
    }

    if (!pin.trim()) {
      newErrors.pin = '핀번호를 입력해주세요';
      hasError = true;
    }

    setErrors(newErrors);

    if (hasError) return;

    socketService.joinRoom(pin, nickname);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-300 to-indigo-500">
      {/* Header */}
      <header className="absolute top-5 left-5">
        <h1
          className="text-white text-3xl font-bold cursor-pointer hover:scale-105 transition-transform duration-300"
          onClick={() => navigate('/')}
        >
          QuizGround
        </h1>
      </header>

      <div className="w-full max-w-md p-8 bg-white shadow-lg rounded-lg border-4 border-blue-400">
        <h2 className="text-2xl font-bold text-center text-blue-500 mb-6">PIN 번호로 입장</h2>

        <TextInput
          label="닉네임"
          value={nickname}
          onChange={(e) => {
            setNickname(e.target.value);
            if (errors.nickname) setErrors((prev) => ({ ...prev, nickname: '' }));
          }}
          error={errors.nickname}
        />

        <TextInput
          label="PIN번호"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            if (errors.pin) setErrors((prev) => ({ ...prev, pin: '' }));
          }}
          error={errors.pin}
          className="mt-4"
        />

        <button
          className="mt-6 w-full h-12 bg-blue-500 text-white font-semibold rounded-lg shadow-md hover:bg-blue-600 hover:shadow-lg active:bg-blue-700 active:shadow-sm transition-all duration-300 ease-in-out"
          onClick={handleJoin}
        >
          들어가기
        </button>
      </div>
    </div>
  );
};
