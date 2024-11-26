import Lottie from 'lottie-react';
import AnswerBg from '@/assets/lottie/answer_background.json';
// import { useEffect, useState } from 'react';

type AnswerModalProps = {
  isOpen: boolean;
  // onClose: () => void;
  answer: number;
};

const AnswerModal: React.FC<AnswerModalProps> = ({ isOpen, answer }) => {
  // const [countdown, setCountdown] = useState(3);

  // useEffect(() => {
  //   if (isOpen) {
  //     setCountdown(3); // 모달이 열릴 때 카운트다운을 초기화
  //     const interval = setInterval(() => {
  //       setCountdown((prev) => {
  //         if (prev === 1) {
  //           clearInterval(interval);
  //           onClose(); // 0에 도달하면 모달 닫기
  //         }
  //         return prev - 1;
  //       });
  //     }, 1000);
  //     return () => clearInterval(interval); // 모달이 닫히거나 언마운트될 때 타이머 정리
  //   }
  // }, [isOpen, onClose]);

  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50 pointer-events-none">
      <Lottie
        animationData={AnswerBg}
        loop={true}
        className="absolute inset-0 w-full h-full object-cover opacity-80 pointer-events-none"
        style={{
          transform: 'scale(1.15)',
          minWidth: '100vw',
          minHeight: '100vh'
        }}
      />

      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-4 p-8">
        <h2 className="text-4xl font-bold text-black">정답 공개</h2>
        <p className="text-2xl text-black" style={{ marginBottom: '4rem' }}>
          {answer}
        </p>
        {/* <button
          onClick={onClose}
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition"
        >
          닫기 ({countdown})
        </button> */}
      </div>
    </div>
  );
};
export default AnswerModal;
