import { ClipboardCopy } from './ClipboardCopy';
import Card from '@mui/material/Card';
import { QuizPreview } from './QuizView';

export const GameHeader = () => {
  // 임시값
  const pinNum = '123456';
  const linkURL = 'naver.com';
  return (
    <Card className="p-4 border border-blue-600 shadow-xl rounded-md h-[280px] w-[1000px] bg-gradient-to-b from-blue-500 to-blue-700 text-white">
      <div className="flex justify-center mb-4">
        <ClipboardCopy valueToCopy={pinNum} message={`PIN: ${pinNum} 복사`} />
        <ClipboardCopy valueToCopy={linkURL} message="공유 링크 복사" />
      </div>
      <div className="flex flex-col items-center justify-center text-center space-y-2">
        <span className="text-xl font-semibold">퀴즈이름22</span>
      </div>
      <QuizPreview title="title" description="퀴즈퀴즈퀴ㅣ즈" />
      <div className="flex space-x-4 justify-center">
        <button className="bg-yellow-400 text-black font-bold py-2 px-4 rounded-md shadow-lg transform hover:translate-y-[-2px] hover:shadow-xl active:translate-y-1 active:shadow-sm transition">
          퀴즈 설정
        </button>
        <button className="bg-blue-500 text-white font-bold py-2 px-4 rounded-md shadow-lg transform hover:translate-y-[-2px] hover:shadow-xl active:translate-y-1 active:shadow-sm transition">
          게임 시작
        </button>
      </div>
    </Card>
  );
};
