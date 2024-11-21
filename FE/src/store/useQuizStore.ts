import { getQuizSetDetail } from '@/api/rest/quizApi';
import { socketService } from '@/api/socket';
import QuizState from '@/constants/quizState';
import { create } from 'zustand';

type Choice = {
  id?: number;
  content: string;
  order: number;
};

type Quiz = {
  id?: string; // 조회 시 id 포함
  quiz: string;
  limitTime?: number;
  choiceList: Choice[];
  answer?: number;
};

type QuizSet = {
  id?: string;
  title: string;
  category: string;
  quizList: Quiz[];
};

type CurrentQuiz = {
  quiz: string;
  choiceList: Choice[];
  endTime: number;
  startTime: number;
};

type QuizStore = {
  quizSetTitle: string;
  quizSetCategory: string;
  quizSets: QuizSet[];
  currentQuiz: CurrentQuiz | null;
  currentAnswer: number;
  quizState: (typeof QuizState)[keyof typeof QuizState];
  setQuizState: (state: (typeof QuizState)[keyof typeof QuizState]) => void;
  setQuizSets: (quizSets: QuizSet[]) => void;
  setCurrentQuiz: (quiz: CurrentQuiz) => void;
  setCurrentAnswer: (answer: number) => void;
  addQuizSet: (quizSet: QuizSet) => void;
  resetQuiz: () => void;
  setQuizSet: (title: string, category: string) => void;
};

export const useQuizeStore = create<QuizStore>((set) => ({
  quizSetTitle: '',
  quizSetCategory: '',
  quizSets: [],
  currentQuiz: null,
  currentAnswer: 0,
  quizState: QuizState.PROGRESS,

  setQuizSets: (quizSets) => set({ quizSets }),
  // 새로운 퀴즈셋 추가
  addQuizSet: (quizSet) =>
    set((state) => ({
      quizSets: [...state.quizSets, quizSet]
    })),

  // 진행 중인 퀴즈 설정
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz }),
  setCurrentAnswer: (answer) => set({ currentAnswer: answer }),
  setQuizState: (state) => set({ quizState: state }),
  resetQuiz: () => set({ quizSets: [], currentQuiz: null }),
  setQuizSet: (title: string, category: string) =>
    set({ quizSetTitle: title, quizSetCategory: category })
}));

// 진행 중인 퀴즈 설정
socketService.on('startQuizTime', (data) => {
  useQuizeStore.getState().setQuizState(QuizState.START);
  useQuizeStore.getState().setCurrentQuiz(data);
});
socketService.on('endQuizTime', (data) => {
  useQuizeStore.getState().setQuizState(QuizState.END);
  useQuizeStore.getState().setCurrentAnswer(Number(data.answer));
});

socketService.on('endGame', () => {
  useQuizeStore.getState().resetQuiz();
});

// TODO update 퀴즈 셋 시 퀴즈셋 받아오기
socketService.on('updateRoomQuizset', async (data) => {
  const res = await getQuizSetDetail(String(data.quizSetId));
  useQuizeStore.getState().setQuizSet(String(res?.title), String(res?.category));
});
