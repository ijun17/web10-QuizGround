import SocketMockChat from './SocketMockChat';
import SocketMockLoadTest from './SocketMockLoadTest';
import SocketMockLoadTestOnlyMove from './SocketMockLoadTestOnlyMove';
import SocketMockLoadTestWithQuiz from './SocketMockLoadTestWithQuiz';
import SocketMockNextQuiz from './SocketMockNextQuiz';
import SocketMockStartEnd from './SocketMockStartEnd';
import SocketMockStartGame from './SocketMockStartGame';

const mockMap = {
  'test-chat': SocketMockChat,
  'test-start-game': SocketMockStartGame,
  'test-next-quiz': SocketMockNextQuiz,
  'test-load': SocketMockLoadTest,
  'test-load-with-quiz': SocketMockLoadTestWithQuiz,
  'test-start-end': SocketMockStartEnd,
  'test-load-only-move': SocketMockLoadTestOnlyMove
} as const;

export default mockMap;
