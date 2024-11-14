const QuizState = {
  START: 'start', // 퀴즈 시작! 3초
  PROGRESS: 'progress', // 퀴즈 진행중!
  END: 'end', // 퀴즈 종료 ! 3초
  WAIT: 'wait' // 퀴즈 대기중 ! 퀴즈 시작 전
} as const;

export default QuizState;
