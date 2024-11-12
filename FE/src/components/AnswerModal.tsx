import Lottie from 'lottie-react';
import AnswerBg from '../assets/lottie/answer_background.json';
type AnswerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  answer: string;
};

const AnswerModal: React.FC<AnswerModalProps> = ({ isOpen, onClose, answer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="relative bg-white rounded-lg shadow-xl w-[550px] h-[500px] flex flex-col items-center justify-center text-center space-y-4">
        <Lottie
          animationData={AnswerBg}
          loop={true}
          className="absolute w-full h-full object-cover rounded-lg opacity-80 pointer-events-none"
        />
        <h2 className="text-3xl font-bold text-gray-800 relative z-10">정답 공개</h2>
        <p className="text-xl text-gray-700 relative z-10">{answer}</p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600 transition relative z-10"
        >
          닫기
        </button>
      </div>
    </div>
  );
};
export default AnswerModal;
