import { useQuizeStore } from '@/store/useQuizStore';
import { useEffect, useState } from 'react';

export const QuizHeader = () => {
  const currentQuiz = useQuizeStore((state) => state.currentQuiz);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (currentQuiz) setSeconds(currentQuiz.endTime);
  }, [currentQuiz]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (seconds <= 0 || !currentQuiz) return;
      setSeconds((currentQuiz.endTime - Date.now()) / 1000);
    });
  }, [currentQuiz, seconds]);

  if (!currentQuiz)
    return (
      <div className="component-popup flex justify-center items-center w-[100%] h-[100%] text-gray-400">
        로딩 중
      </div>
    );
  return (
    <div className="component-popup w-[100%] h-[100%]">
      <div>{seconds <= 0 ? '시간 종료' : seconds.toFixed(2)}</div>
      <div className="font-bold text-2xl">{'Q. ' + currentQuiz.quiz}</div>
    </div>
  );
};
