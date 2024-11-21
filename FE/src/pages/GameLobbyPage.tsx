import { HeaderBar } from '@/components/HeaderBar';
import { LobbyList } from '@/components/LobbyList';

// api 코드 분리 폴더 구조 논의
// const fetchLobbyRooms = async () => {
//   const response = await fetch("/api/lobbies");
//   const data = await response.json();
//   return data;
// };

const rooms = [
  {
    title: 'Fun Quiz Night',
    gameMode: 'Classic',
    maxPlayerCount: 10,
    currentPlayerCount: 7,
    quizSetTitle: 'General Knowledge',
    gameId: 'room1'
  },
  {
    title: 'Fast Fingers Challenge',
    gameMode: 'Speed Round',
    maxPlayerCount: 8,
    currentPlayerCount: 5,
    quizSetTitle: 'Science Trivia',
    gameId: 'room2'
  },
  {
    title: 'Trivia Titans',
    gameMode: 'Battle Mode',
    maxPlayerCount: 12,
    currentPlayerCount: 9,
    quizSetTitle: 'History and Geography',
    gameId: 'room3'
  },
  {
    title: 'Casual Fun',
    gameMode: 'Relaxed',
    maxPlayerCount: 6,
    currentPlayerCount: 3,
    quizSetTitle: 'Pop Culture',
    gameId: 'room4'
  },
  {
    title: 'Quick Thinkers',
    gameMode: 'Fast Play',
    maxPlayerCount: 10,
    currentPlayerCount: 6,
    quizSetTitle: 'Sports Trivia',
    gameId: 'room5'
  }
];

export const GameLobbyPage = () => {
  // const [rooms, setRooms] = useState([]);

  // useEffect(() => {
  //   fetchLobbyRooms().then(setRooms);
  // }, []);

  return (
    <div>
      <HeaderBar />
      <LobbyList rooms={rooms} />
    </div>
  );
};
