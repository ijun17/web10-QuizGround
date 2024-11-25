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
};
import { useNavigate } from 'react-router-dom';

export const LobbyList: React.FC<LobbyListProps> = ({ rooms }) => {
  const navigate = useNavigate();

  const handleJoinRoom = (gameId: string) => {
    console.log(gameId, 'joinRoom click');
    navigate(`/game/${gameId}`);
  };
  return (
    <div className="flex flex-col items-center p-4">
      <header className="mb-6">
        <h1 className="text-2xl font-bold text-blue-600">대기실 목록</h1>
      </header>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full max-w-7xl">
        {rooms.map((room) => (
          <div
            key={room.gameId}
            className="bg-white rounded-lg shadow-lg p-4 flex flex-col items-center text-center border border-gray-200 hover:shadow-xl transition"
          >
            <h2 className="text-lg font-semibold text-gray-800">{room.title}</h2>
            <p className="text-sm text-gray-500 mt-2">{room.gameMode}</p>
            <p className="text-sm text-gray-500">
              {room.currentPlayerCount}/{room.maxPlayerCount} Players
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Quiz: <span className="text-gray-800 font-medium">{room.quizSetTitle}</span>
            </p>
            <button
              className="mt-4 bg-blue-500 text-white py-1 px-4 rounded-lg hover:bg-blue-600 transition"
              onClick={() => handleJoinRoom(room.gameId)}
            >
              Join Room
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
