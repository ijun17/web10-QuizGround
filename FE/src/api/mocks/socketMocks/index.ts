import SocketMockChat from './SocketMockChat';
import SocketMockStartGame from './SocketMockStartGame';

const mockMap = {
  'test-chat': SocketMockChat,
  'test-start-game': SocketMockStartGame
} as const;

export default mockMap;
