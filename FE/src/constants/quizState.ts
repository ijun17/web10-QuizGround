const QuizState = {
  START: 'start', // 퀴즈 시작!
  PROGRESS: 'progress', // 퀴즈 진행중!
  END: 'end', // 퀴즈 종료 !
  WAIT: 'wait' // 퀴즈 대기중 !
} as const;

export default QuizState;
