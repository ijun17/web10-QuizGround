import SocketMockChat from './SocketMockChat';
import SocketMockForReadmeSurvival from './SocketMockForReadmeSurvival';
import SocketMockForReadmeRanking from './SocketMockForReadmeRanking';
import SocketMockForReadme200 from './SocketMockForReadme200';
import SocketMockHost from './SocketMockHost';
import SocketMockLoadTest from './SocketMockLoadTest';
import SocketMockLoadTestOnlyMove from './SocketMockLoadTestOnlyMove';
import SocketMockLoadTestWithQuiz from './SocketMockLoadTestWithQuiz';
import SocketMockNextQuiz from './SocketMockNextQuiz';
import SocketMockStartEnd from './SocketMockStartEnd';
import SocketMockStartGame from './SocketMockStartGame';

const mockMap = {
  'test-chat': SocketMockChat,
  'test-host': SocketMockHost,
  'test-start-game': SocketMockStartGame,
  'test-next-quiz': SocketMockNextQuiz,
  'test-load': SocketMockLoadTest,
  'test-load-with-quiz': SocketMockLoadTestWithQuiz,
  'test-start-end': SocketMockStartEnd,
  'test-load-only-move': SocketMockLoadTestOnlyMove,
  'readme-survival': SocketMockForReadmeSurvival,
  'readme-ranking': SocketMockForReadmeRanking,
  'readme-200': SocketMockForReadme200
} as const;

export default mockMap;
