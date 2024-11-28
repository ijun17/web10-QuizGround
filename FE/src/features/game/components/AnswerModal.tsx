// import Lottie from 'lottie-react';
import lottie from 'lottie-web';
// import AnswerBg from '@/assets/lottie/answer_background.json';
import AnswerBg from '@/assets/lottie/congrats.json';
import { useEffect, useState, useRef } from 'react';
import { useQuizStore } from '../data/store/useQuizStore';

type AnswerModalProps = {
  isOpen: boolean;
  answer: number;
};

const AnswerModal: React.FC<AnswerModalProps> = ({ isOpen, answer }) => {
  const [countdown, setCountdown] = useState(3);
  const currentQuiz = useQuizStore((state) => state.currentQuiz);

  useEffect(() => {
    if (isOpen) {
      setCountdown(3);
      const interval = setInterval(() => {
        setCountdown((prev: number) => {
          if (prev === 1) {
            clearInterval(interval);
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  const effectRef = useRef(null);

  useEffect(() => {
    if (isOpen && effectRef.current) {
      const animation = lottie.loadAnimation({
        container: effectRef.current,
        renderer: 'canvas',
        loop: true,
        autoplay: true,
        animationData: AnswerBg
      });

      const timer = setTimeout(() => {
        animation.stop();
      }, 3000);

      return () => {
        animation.destroy();
        clearTimeout(timer);
      };
    }
  }, [isOpen]);

  if (!isOpen || countdown <= 0) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-25 z-50 pointer-events-none">
      {/* <Lottie
        animationData={AnswerBg}
        loop={true}
        className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
        style={{
          transform: 'scale(1.15)',
          minWidth: '100vw',
          minHeight: '100vh'
        }}
      /> */}
      {
        <div
          ref={effectRef}
          className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
          style={{
            transform: 'scale(1.15)',
            minWidth: '100vw',
            minHeight: '100vh'
          }}
        />
      }

      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 p-8">
        <h2 className="text-4xl font-bold text-black">정답 공개</h2>
        <p className="text-4xl text-black" style={{ marginBottom: '4rem' }}>
          {currentQuiz?.choiceList.find((e) => e.order == answer)?.content}
        </p>
      </div>
    </div>
  );
};
export default AnswerModal;
