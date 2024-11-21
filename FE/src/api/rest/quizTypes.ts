export type QuizSet = {
  id: string;
  title: string;
  category: string;
  quizCount: number;
};

export type Paging = {
  nextCursor: string;
  hasNextPage: boolean;
};

export type QuizSetListResponse = {
  quizSetList: QuizSet[];
  paging: Paging;
};

export type QuizChoiceInput = {
  content: string;
  order: number;
  isAnswer: boolean;
};

export type QuizInput = {
  quiz: string;
  limitTime: number;
  choiceList: QuizChoiceInput[];
};

export type CreateQuizSetPayload = {
  title: string;
  category: string;
  quizList: QuizInput[];
};

export type CreateQuizSetResponse = {
  id: string;
};

export type QuizChoice = {
  content: string;
  order: number;
  isAnswer: boolean;
};

export type Quiz = {
  id: string;
  quiz: string;
  limitTime: number;
  choiceList: QuizChoice[];
};

export type QuizSetDetailResponse = {
  id: string;
  title: string;
  category: string;
  quizList: Quiz[];
};
