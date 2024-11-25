import { HeaderBar } from '@/components/HeaderBar';
import { useState } from 'react';

type QuizListProps = {
  title: string;
  quizzes: string[];
  activeTab: string;
};

export const MyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'myQuizzes' | 'solvedQuizzes'>('myQuizzes');

  const myQuizzes = ['퀴즈 1', '퀴즈 2', '퀴즈 3', '퀴즈 4']; // 예시 데이터
  const solvedQuizzes = ['퀴즈 A', '퀴즈 B', '퀴즈 C', '퀴즈 D']; // 예시 데이터

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      <HeaderBar />

      <div className="flex flex-col items-center mt-8">
        <div className="w-24 h-24 rounded-full bg-gray-300 overflow-hidden mb-4">
          <img
            src="https://via.placeholder.com/100" // 임시 프로필 이미지
            alt="Profile"
            className="w-full h-full object-cover"
          />
        </div>
        <h2 className="text-lg font-bold">닉네임</h2>
      </div>

      <div className="mt-8 px-4">
        <div className="flex justify-center space-x-4 border-b border-gray-300 pb-2">
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'myQuizzes'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('myQuizzes')}
          >
            내가 만든 퀴즈
          </button>
          <button
            className={`px-4 py-2 font-medium ${
              activeTab === 'solvedQuizzes'
                ? 'text-blue-500 border-b-2 border-blue-500'
                : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('solvedQuizzes')}
          >
            내가 풀이한 퀴즈
          </button>
        </div>

        {/* 리스트 */}
        <div className="mt-4">
          {activeTab === 'myQuizzes' ? (
            <QuizList title="내가 만든 퀴즈" quizzes={myQuizzes} activeTab={activeTab} />
          ) : (
            <QuizList title="내가 풀이한 퀴즈" quizzes={solvedQuizzes} activeTab={activeTab} />
          )}
        </div>
      </div>
    </div>
  );
};

// 퀴즈 리스트 컴포넌트
const QuizList: React.FC<QuizListProps> = ({ title, quizzes, activeTab }) => {
  const handleEdit = (index: number) => {
    console.log(index + '수정 클릭');
  };
  const handleDelete = (index: number) => {
    console.log(index + '삭제 클릭');
  };
  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-md overflow-y-auto max-h-90">
      <h3 className="text-lg font-bold mb-4">{title}</h3>
      <ul className="space-y-2">
        {quizzes.map((quiz, index) => (
          <li key={index} className="p-2 border-b flex justify-between items-center">
            <span>{quiz}</span>
            <div className="flex gap-2">
              {activeTab === 'myQuizzes' && (
                <button
                  onClick={() => handleEdit(index)}
                  className="px-2 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  수정
                </button>
              )}
              <button
                onClick={() => handleDelete(index)}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                삭제
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
