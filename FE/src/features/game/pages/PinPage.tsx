import { socketService, useSocketEvent, useSocketException } from '@/api/socket';
import { Header } from '@/components/Header';
import { TextInput } from '@/components/TextInput';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CustomButton from '../../../components/CustomButton';
import Lottie from 'lottie-react';
import pinBg from '../../../assets/lottie/pinSerch.json';

export const PinPage = () => {
  const [pin, setPin] = useState('');
  const [errors, setErrors] = useState({ nickname: '', pin: '' });
  const navigate = useNavigate();

  useSocketEvent('joinRoom', () => {
    navigate(`/game/${pin}`);
  });

  useSocketException('connection', (data) => {
    alert(data.split('\n')[0]);
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

    socketService.disconnect();
    socketService.joinRoom(pin);
  };

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-300 to-indigo-500">
      <Header />

      <div className="absolute inset-0 flex items-center justify-center z-0">
        <div className="w-[1600px] h-[800px]">
          <Lottie animationData={pinBg} loop={true} autoplay={true} className="w-full h-full" />
        </div>
      </div>

      <div className="relative z-10 w-full max-w-md p-8 bg-white shadow-lg rounded-lg border-4 border-blue-400 mt-[-100px]">
        <h2 className="text-2xl font-bold text-center text-blue-500 mb-6">PIN 번호로 입장</h2>
        <TextInput
          label="핀번호"
          value={pin}
          onChange={(e) => {
            setPin(e.target.value);
            if (errors.pin) setErrors((prev) => ({ ...prev, pin: '' }));
          }}
          error={errors.pin}
        />
        <CustomButton text="들어가기" onClick={handleJoin} />
      </div>
    </div>
  );
};
