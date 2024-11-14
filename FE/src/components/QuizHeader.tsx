import { useQuizeStore } from '@/store/useQuizStore';
import { useEffect, useState } from 'react';
import AnswerModal from './AnswerModal';
import QuizState from '@/constants/quizState';

export const QuizHeader = () => {
  const currentQuiz = useQuizeStore((state) => state.currentQuiz);
  const quizState = useQuizeStore((state) => state.quizState);
  const [seconds, setSeconds] = useState(0);
  const [isAnswerVisible, setIsAnswerVisible] = useState(false);
  const answer = '1';
  useEffect(() => {
    if (currentQuiz) setSeconds(currentQuiz.endTime);
  }, [currentQuiz]);
  useEffect(() => {
    if (quizState === QuizState.END) {
      setIsAnswerVisible(true);

      // 5초 후에 자동으로 false로 설정
      const timer = setTimeout(() => {
        setIsAnswerVisible(false);
      }, 5000);

      // 컴포넌트가 언마운트될 때 타이머 정리
      return () => clearTimeout(timer);
    }
  }, [quizState]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (seconds <= 0 || !currentQuiz) return;
      setSeconds((currentQuiz.endTime - Date.now()) / 1000);
    });
  }, [currentQuiz, seconds]);

  if (!currentQuiz)
    return (
      <div className="component-popup flex justify-center items-center h-[280px] w-[1000px] text-gray-400">
        로딩 중
      </div>
    );
  return (
    <div className="component-popup h-[280px] w-[1000px] p-8 flex flex-col">
      <div className="flex flex-row-reverse ">
        <div className="flex justify-center items-center text-red-500 bg-gray-700 rounded-lg w-24 h-8 font-bold text-lg">
          {' '}
          {seconds <= 0 ? '종료' : seconds.toFixed(2)}
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
