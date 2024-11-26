export const mockQuizData = {
  id: '1',
  title: '기본 퀴즈셋',
  category: 'common',
  quizList: [
    {
      id: '1',
      quiz: '호눅스님과 jk 님은 동갑인가요?',
      limitTime: 30,
      choiceList: [
        {
          content: 'O',
          order: 1,
          isAnswer: true
        },
        {
          content: 'X',
          order: 2,
          isAnswer: false
        },
        {
          content: '모르겠다.',
          order: 3,
          isAnswer: false
        },
        {
          content: '크롱',
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
          content: '킹받쥬?',
          order: 4,
          isAnswer: false
        }
      ]
    }
  ]
};
