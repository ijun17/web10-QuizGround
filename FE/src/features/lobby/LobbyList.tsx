import Lottie from 'lottie-react';
import refreshIcon from '../../assets/lottie/refresh.json';
type Room = {
  title: string;
  gameMode: string;
  maxPlayerCount: number;
  currentPlayerCount: number;
  quizSetTitle: string;
  gameId: string;
};

type LobbyListProps = {
  rooms: Room[];
  refreshRooms: () => void;
};
import { useNavigate } from 'react-router-dom';

export const LobbyList: React.FC<LobbyListProps> = ({ rooms, refreshRooms }) => {
  const navigate = useNavigate();

  const handleJoinRoom = (gameId: string) => {
    console.log(gameId, 'joinRoom click');
    navigate(`/game/${gameId}`);
  };
  return (
    <div className="flex flex-col items-center px-4 py-6 w-full max-w-7xl mt-14">
      <header className="flex items-center mb-8">
        <h1 className="text-3xl font-extrabold text-white mr-8">게임 대기실 목록</h1>
        <Lottie
          animationData={refreshIcon}
          loop={true}
          autoplay={true}
          className="mx-auto cursor-pointer"
          style={{
            width: '50px',
            height: '50px'
          }}
          onClick={refreshRooms}
        />
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 w-full">
        {rooms.map((room) => (
          <div
            key={room.gameId}
            className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center text-center border border-blue-300 hover:shadow-lg hover:scale-105 transition-transform duration-300"
          >
            <h2 className="text-lg font-semibold text-gray-800">{room.title}</h2>

            <div className="text-sm text-gray-600 mt-2">
              <p>
                게임 모드: <span className="text-gray-800">{room.gameMode}</span>
              </p>
              <p>
                인원: {room.currentPlayerCount} / {room.maxPlayerCount}
              </p>
              <p className="mt-1">
                퀴즈 세트: <span className="font-medium text-blue-600">{room.quizSetTitle}</span>
              </p>
            </div>
            <button
              className="mt-4 bg-blue-500 text-white font-semibold py-2 px-6 rounded-lg shadow hover:bg-blue-600 hover:shadow-lg active:bg-blue-700 transition-colors"
              onClick={() => handleJoinRoom(room.gameId)}
            >
              방 입장하기
            </button>
          </div>
        ))}
        {!rooms.length && (
          <div className="text-white col-span-full text-center text-lg mr-8">
            현재 표시할 방이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
