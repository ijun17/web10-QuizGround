// 채팅 메시지 전달 타입
type ChatMessageRequest = {
  gameId: string; // PIN
  message: string;
};

type ChatMessageResponse = {
  playerId: string; // socketId
  playerName: string;
  message: string;
  timestamp: Date;
};

// 플레이어 위치 업데이트 타입
type UpdatePositionRequest = {
  gameId: string;
  newPosition: [number, number];
};

type UpdatePositionResponse = {
  playerId: string; // socketId
  playerPosition: [number, number];
};

// 게임방 생성 타입
type CreateRoomRequest = {
  title: string;
  gameMode: 'RANKING' | 'SURVIVAL';
  maxPlayerCount: number;
  isPublic: boolean;
};

type CreateRoomResponse = {
  gameId: string; // PIN
};

// 게임방 옵션 수정 타입
type UpdateRoomOptionRequest = {
  gameId: string;
  title: string;
  gameMode: 'RANKING' | 'SURVIVAL';
  maxPlayerCount: number;
  isPublic: boolean;
};

type UpdateRoomOptionResponse = {
  title: string;
  gameMode: 'RANKING' | 'SURVIVAL';
  maxPlayerCount: number;
  isPublic: boolean;
};

// 게임방 퀴즈셋 수정 타입
type UpdateRoomQuizsetRequest = {
  quizsetId: number;
  quizCount: number;
};

type UpdateRoomQuizsetResponse = {
  quizsetId: number;
  quizCount: number;
};

// 게임방 입장 타입
type JoinRoomRequest = {
  gameId: string;
  playerName: string;
};

type JoinRoomResponse = {
  players: Array<{
    playerId: string; // socketId
    playerName: string;
    playerPosition: [number, number];
  }>;
};

// 게임 시작 타입
type StartGameRequest = {
  gameId: string;
};

type StartGameResponse = Record<string, never>; // 빈 객체

// 게임 정지 타입
type StopGameRequest = {
  gameId: string;
};

type StopGameResponse = {
  status: string;
};

// 퀴즈 시간 종료 타입
type EndQuizTimeEvent = {
  gameId: string;
};

// 퀴즈 시작 타입
type StartQuizTimeEvent = {
  quiz: string;
  options: string[];
  quizEndTime: Date;
};

// 게임 점수 업데이트 타입
type UpdateScoreEvent = {
  scores: Map<string, number>; // Map<playerId, score>
};

// 게임방 퇴장 타입
type ExitRoomEvent = {
  playerId: string;
};

// 전체 소켓 이벤트 타입 맵
export type SocketDataMap = {
  chatMessage: {
    request: ChatMessageRequest;
    response: ChatMessageResponse;
  };
  updatePosition: {
    request: UpdatePositionRequest;
    response: UpdatePositionResponse;
  };
  createRoom: {
    request: CreateRoomRequest;
    response: CreateRoomResponse;
  };
  updateRoomOption: {
    request: UpdateRoomOptionRequest;
    response: UpdateRoomOptionResponse;
  };
  updateRoomQuizset: {
    request: UpdateRoomQuizsetRequest;
    response: UpdateRoomQuizsetResponse;
  };
  joinRoom: {
    request: JoinRoomRequest;
    response: JoinRoomResponse;
  };
  startGame: {
    request: StartGameRequest;
    response: StartGameResponse;
  };
  stopGame: {
    request: StopGameRequest;
    response: StopGameResponse;
  };
  endQuizTime: {
    request: null;
    response: EndQuizTimeEvent;
  };
  startQuizTime: {
    request: null;
    response: StartQuizTimeEvent;
  };
  updateScore: {
    request: null;
    response: UpdateScoreEvent;
  };
  exitRoom: {
    request: null;
    response: ExitRoomEvent;
  };
};
