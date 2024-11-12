type AnswerModalProps = {
  isOpen: boolean;
  onClose: () => void;
  answer: string;
};

const AnswerModal: React.FC<AnswerModalProps> = ({ isOpen, onClose, answer }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-xl p-6 w-[400px] text-center space-y-4">
        <h2 className="text-2xl font-bold text-gray-800">정답 공개</h2>
        <p className="text-lg text-gray-700">{answer}</p>
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition"
        >
          닫기
        </button>
      </div>
    </div>
  );
};

export default AnswerModal;
