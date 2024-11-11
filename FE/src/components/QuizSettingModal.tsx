import { useState } from 'react';
import { QuizPreview } from './QuizView';

type Quiz = {
  title: string;
  category: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const sampleQuizList = [
  { title: 'quiz1', category: 'category1' },
  { title: 'quiz1', category: 'category1' },
  { title: 'quiz1', category: 'category1' },
  { title: 'quiz1', category: 'category1' },
  { title: 'quiz1', category: 'category1' },
  { title: 'quiz1', category: 'category1' }
];

export const QuizSettingModal = ({ isOpen, onClose }: Props) => {
  const [quizList, setQuizList] = useState<Quiz[]>([]);
  const [selectedQuizId, setSelectedQuizId] = useState<number>(-1);
  const [inputValue, setInputValue] = useState('');
  const [quizCount, setQuizCount] = useState(0);

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    //fetch
    setQuizList(sampleQuizList);
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-10"
      style={{ display: isOpen ? 'flex' : 'none' }}
    >
      <div className="component-popup max-w-lg w-full">
        <div>
          <div className="flex justify-between p-5 h-20">
            <form className="relative flex-grow flex items-center" onSubmit={handleSearch}>
              <input
                className="absolute pl-8 bg-gray-100 border border-gray-200 rounded-xl h-[100%] w-[100%]"
                type="text"
                id="quiz-search-bar"
                placeholder="퀴즈 이름 또는 카테고리"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
              />
              <div className="absolute left-2">🍭</div>
            </form>
            <button className="font-black ml-4" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="flex flex-col pl-2 pr-2 max-h-[30vh] overflow-y-auto">
            {quizList.map((_, i) => (
              <div
                className="mb-2 rounded-m"
                onClick={() => setSelectedQuizId(i)}
                key={i}
                style={{ border: 'solid 2px ' + (selectedQuizId === i ? 'lightgreen' : 'white') }}
              >
                <QuizPreview title={'test'} description={'test'} />
              </div>
            ))}
          </div>
        </div>
        <div className="border-t border-default">
          {selectedQuizId >= 0 ? (
            <div className="flex flex-col p-4 gap-4">
              <div className="font-bold text-lg">선택된 퀴즈</div>
              <QuizPreview title="test" description="test" />
              <div>
                <span className="mr-4">{`퀴즈 개수(${quizCount})`}</span>
                <input
                  type="range"
                  min={1}
                  max={100}
                  value={quizCount}
                  onChange={(e) => setQuizCount(Number(e.target.value))}
                />
              </div>
              <div className="flex flex-row-reverse">
                <button className="bg-main text-white font-bold rounded-md w-20 h-8">
                  설정 완료
                </button>
              </div>
            </div>
          ) : (
            <div className="h-[100px] flex justify-center items-center text-gray-400">
              퀴즈를 선택해주세요
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
