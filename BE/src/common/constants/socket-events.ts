const SocketEvents = {
  CHAT_MESSAGE: 'chatMessage',
  UPDATE_POSITION: 'updatePosition',
  CREATE_ROOM: 'createRoom',
  UPDATE_ROOM_OPTION: 'updateRoomOption',
  UPDATE_ROOM_QUIZSET: 'updateRoomQuizset',
  JOIN_ROOM: 'joinRoom',
  START_GAME: 'startGame',
  END_GAME: 'endGame',
  END_QUIZ_TIME: 'endQuizTime',
  START_QUIZ_TIME: 'startQuizTime',
  UPDATE_SCORE: 'updateScore',
  EXIT_ROOM: 'exitRoom',
  KICK_ROOM: 'kickRoom',
  SET_PLAYER_NAME: 'setPlayerName'
} as const;

export default SocketEvents;
