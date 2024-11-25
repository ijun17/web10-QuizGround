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
  reset: () => void;
};

export const useQuizStore = create<QuizStore>((set) => ({
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
    set({ quizSetTitle: title, quizSetCategory: category }),
  reset: () =>
    set({
      quizSetTitle: '',
      quizSetCategory: '',
      quizSets: [],
      currentQuiz: null,
      currentAnswer: 0,
      quizState: QuizState.PROGRESS
    })
}));
