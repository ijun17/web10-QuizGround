export const REDIS_KEY = {
  ROOM: (gameId: string) => `Room:${gameId}`,
  ROOM_PLAYER: (gameId: string, playerId: string) => `Room:${gameId}:Player:${playerId}`,
  ROOM_QUIZ: (gameId: string, quizId: string) => `Room:${gameId}:Quiz:${quizId}`,
  ROOM_QUIZ_CHOICES: (gameId: string, quizId: string) => `Room:${gameId}:Quiz:${quizId}:Choices`,
  ROOM_LEADERBOARD: (gameId: string) => `Room:${gameId}:Leaderboard`,
  ROOM_CURRENT_QUIZ: (gameId: string) => `Room:${gameId}:CurrentQuiz`,
  ROOM_QUIZ_SET: (gameId: string) => `Room:${gameId}:QuizSet`,

  ACTIVE_ROOMS: 'ActiveRooms',  // 활성화된 방 목록을 저장하는 Set (핀번호 중복 체크하기 위함)
};