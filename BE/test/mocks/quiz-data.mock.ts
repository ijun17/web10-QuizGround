export const mockQuizData = {
  id: '1',
  title: '재미있는 상식 퀴즈',
  category: 'common',
  quizList: [
    {
      id: '1',
      quiz: '다음 중 대한민국의 수도는?',
      limitTime: 30,
      choiceList: [
        {
          content: '서울',
          order: 1,
          isAnswer: true
        },
        {
          content: '부산',
          order: 2,
          isAnswer: false
        },
        {
          content: '인천',
          order: 3,
          isAnswer: false
        },
        {
          content: '대구',
          order: 4,
          isAnswer: false
        }
      ]
    },
    {
      id: '2',
      quiz: '1 + 1 = ?',
      limitTime: 20,
      choiceList: [
        {
          content: '1',
          order: 1,
          isAnswer: false
        },
        {
          content: '2',
          order: 2,
          isAnswer: true
        },
        {
          content: '3',
          order: 3,
          isAnswer: false
        },
        {
          content: '4',
          order: 4,
          isAnswer: false
        }
      ]
    }
  ]
};
