import SocketMockChat from './SocketMockChat';
import SocketMockLoadTest from './SocketMockLoadTest';
import SocketMockLoadTestWithQuiz from './SocketMockLoadTestWithQuiz';
import SocketMockNextQuiz from './SocketMockNextQuiz';
import SocketMockStartGame from './SocketMockStartGame';

const mockMap = {
  'test-chat': SocketMockChat,
  'test-start-game': SocketMockStartGame,
  'test-next-quiz': SocketMockNextQuiz,
  'test-load': SocketMockLoadTest,
  'test-load-with-quiz': SocketMockLoadTestWithQuiz
} as const;

export default mockMap;
