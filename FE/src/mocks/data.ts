export const QuizSetList = Array(100)
  .fill(null)
  .map((_, i) => ({
    id: i,
    title: 'title ' + i,
    category: 'category ' + i,
    quizCount: i
    // quizList: Array(i).fill({
    //   id: '0',
    //   quiz: '',
    //   limitTime: 1000,
    //   choiceList: {
    //     content: 'content',
    //     order: 1
    //   }
    // })
  }));
