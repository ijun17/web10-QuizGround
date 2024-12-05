import { useSocketEvent } from '@/api/socket';
import { useState } from 'react';
import { usePlayerStore } from '../data/store/usePlayerStore';
import { useNavigate } from 'react-router-dom';

export const KickModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const currentPlayerId = usePlayerStore((state) => state.currentPlayerId);
  const navigate = useNavigate();

  useSocketEvent('kickRoom', (data) => {
    console.log('adskfhdsfkj', data.playerId);
    if (data.playerId === currentPlayerId) {
      setIsOpen(true);
    }
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10">
      <div className="bg-white rounded-lg shadow-lg p-6 max-w-sm w-full">
        <h2 className="text-xl font-semibold mb-4">호스트에 의해 퇴장되었습니다</h2>
        <div className="flex justify-end">
          <button
            onClick={() => navigate('/')}
            className="bg-blue-500 text-white rounded-md px-4 py-2 mr-2 hover:bg-blue-600"
          >
            메인페이지로 이동
          </button>
        </div>
      </div>
    </div>
  );
};
