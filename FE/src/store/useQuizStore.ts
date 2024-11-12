import { socketService } from '@/api/socket';
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
};

type QuizStore = {
  quizSets: QuizSet[];
  currentQuiz: CurrentQuiz | null;
  setQuizSets: (quizSets: QuizSet[]) => void;
  setCurrentQuiz: (quiz: CurrentQuiz) => void;
  addQuizSet: (quizSet: QuizSet) => void;
};

export const useQuizeStore = create<QuizStore>((set) => ({
  quizSets: [],
  currentQuiz: null,

  setQuizSets: (quizSets) => set({ quizSets }),

  // 새로운 퀴즈셋 추가
  addQuizSet: (quizSet) =>
    set((state) => ({
      quizSets: [...state.quizSets, quizSet]
    })),

  // 진행 중인 퀴즈 설정
  setCurrentQuiz: (quiz) => set({ currentQuiz: quiz })
}));

// 진행 중인 퀴즈 설정
socketService.on('startQuizTime', (data) => {
  useQuizeStore.getState().setCurrentQuiz(data);
});
