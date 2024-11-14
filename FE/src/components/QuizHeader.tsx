import { useQuizeStore } from '@/store/useQuizStore';
import { useEffect, useState } from 'react';
import AnswerModal from './AnswerModal';
import QuizState from '@/constants/quizState';
import Lottie from 'lottie-react';
import quizLoading from '../assets/lottie/quiz_loading.json';

export const QuizHeader = () => {
  const currentQuiz = useQuizeStore((state) => state.currentQuiz);
  const quizState = useQuizeStore((state) => state.quizState);
  const [seconds, setSeconds] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const [limitTime, setLimitTime] = useState(0);
  const answer = '1';
  useEffect(() => {
    if (currentQuiz) {
      setSeconds((currentQuiz.endTime - Date.now()) / 1000);
      setLimitTime((currentQuiz.endTime - currentQuiz.startTime) / 1000);
    }
  }, [currentQuiz]);

  useEffect(() => {
    setIsAnswerVisible(quizState === QuizState.END);
  }, [quizState]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (seconds <= 0 || !currentQuiz) return;
      setSeconds((currentQuiz.endTime - Date.now()) / 1000);
    });
  }, [currentQuiz, seconds]);

  if (!currentQuiz)
    return (
      <div className="border border-default component-popup flex justify-center items-center h-[280px] w-[1000px] text-gray-400">
        <Lottie animationData={quizLoading} loop={true} className="w-[150px] h-[150px] mr-4" />
        <div>곧 퀴즈가 시작됩니다</div>
      </div>
    );

  if (currentQuiz.startTime > Date.now())
    return (
      <div className="border border-default component-popup flex justify-center items-center h-[280px] w-[1000px] text-orange-300 font-bold text-7xl">
        {Math.ceil((currentQuiz.startTime - Date.now()) / 1000)}
      </div>
    );
  return (
    <div className="border border-default component-popup h-[280px] w-[1000px] p-8 flex flex-col">
      <div className="flex flex-row-reverse w-[100%] h-8 bg-surface-alt">
        <div
          className="flex justify-center items-center w-20 h-8 text-lg absolute"
          style={{ color: seconds / limitTime > 0.2 ? 'black' : 'red' }}
        >
          {seconds <= 0 ? '종료' : seconds.toFixed(2)}
        </div>
        <div className="w-[100%] h-[100%]">
          <div
            className="bg-black h-[100%]"
            style={{
              width: (seconds / limitTime) * 100 + '%',
              background: seconds / limitTime > 0.2 ? 'green' : 'brown'
            }}
          ></div>
        </div>
      </div>
      <div className="flex justify-center items-center font-bold text-2xl flex-grow">
        {'Q. ' + currentQuiz.quiz}
      </div>
      <AnswerModal
        isOpen={isAnswerVisible}
        onClose={() => setIsAnswerVisible(false)}
        answer={answer}
      />
    </div>
  );
};
