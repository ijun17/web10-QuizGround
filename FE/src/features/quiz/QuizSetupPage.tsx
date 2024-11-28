import { useCallback, useEffect, useState } from 'react';
import { TextField, Select, MenuItem, Box, SelectChangeEvent } from '@mui/material';
import { TextInput } from '@/components/TextInput';
import { createQuizSet } from '@/api/rest/quizApi';
import { CreateQuizSetPayload } from '@/api/rest/quizTypes';
import { Header } from '@/components/Header';
import CustomButton from '@/components/CustomButton';
import QuizsetCategory from '@/constants/quizsetCategory';
/*
{
 title: string,              // 퀴즈셋의 제목
 category: string,   // 퀴즈셋 카테고리
 quizSet: {                 // 퀴즈들
   quiz: string,             // 퀴즈 질문
   limitTime: number,       // 제한 시간 (선택)
   choices: {                // 선택지
     content: string,        // 선택지 내용
     order: number          // 선택지 번호
     isAnswer: boolean
   }[],
 }[]
}
*/
type Choice = {
  choiceContent: string;
  choiceOrder: number;
  isAnswer: boolean;
};

type Quiz = {
  quiz: string;
  limitTime: number;
  choiceList: Choice[];
};

type QuizData = {
  title: string;
  category: string;
  quizSet: Quiz[];
};

export const QuizSetupPage: React.FC = () => {
  const [title, setTitle] = useState('');
  const [titleError, setTitleError] = useState('');
  const [category, setCategory] = useState('');
  const [quizSet, setQuizSet] = useState<Quiz[]>([]);
  const [quizErrorIndex, setQuizErrorIndex] = useState<null | number>(null);
  const [choiceErrorIndex, setChoiceErrorIndex] = useState<null | [number, number]>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 빌드가 되기 위해 변수 사용
  console.log(isSubmitting);

  const handleTitleChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    setTitle(e.target.value);
    setTitleError('');
  };

  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setCategory(e.target.value);
  };

  // 퀴즈 이름 변경
  const handleQuizChange = (index: number, value: string) => {
    const updatedQuizSet = [...quizSet];
    updatedQuizSet[index].quiz = value;
    setQuizSet(updatedQuizSet);
    if (index === quizErrorIndex) setQuizErrorIndex(null);
  };

  // 제한 시간 변경
  const handleLimitTimeChange = (index: number, value: string) => {
    const updatedQuizSet = [...quizSet];
    let newLimitTime = parseInt(value, 10);
    if (newLimitTime > 99) newLimitTime %= 10;
    updatedQuizSet[index].limitTime = Math.min(60, Math.max(3, newLimitTime));
    setQuizSet(updatedQuizSet);
  };

  // 질문지 변경
  const handleChoiceChange = (
    quizIndex: number,
    choiceIndex: number,
    field: keyof Choice,
    value: string
  ) => {
    const updatedQuizSet = [...quizSet];
    if (field === 'isAnswer') {
      // 정답인지를 수정한 경우
      updatedQuizSet[quizIndex].choiceList = updatedQuizSet[quizIndex].choiceList.map((c, i) => ({
        ...c,
        isAnswer: choiceIndex === i
      }));
    } else {
      // 질문지 인풋을 수정한 경우
      (updatedQuizSet[quizIndex].choiceList[choiceIndex][field] as string) = value;
      if (
        choiceErrorIndex &&
        quizIndex === choiceErrorIndex[0] &&
        choiceIndex === choiceErrorIndex[1]
      )
        setChoiceErrorIndex(null);
    }
    setQuizSet(updatedQuizSet);
  };

  // 퀴즈 추가
  const addQuiz = useCallback(() => {
    setQuizSet([
      ...quizSet,
      {
        quiz: '',
        limitTime: 10,
        choiceList: [
          { choiceContent: '', choiceOrder: 1, isAnswer: true },
          { choiceContent: '', choiceOrder: 2, isAnswer: false }
        ]
      }
    ]);
  }, [quizSet]);

  const removeQuiz = (quizIndex: number) => {
    setQuizSet(quizSet.filter((_, i) => i !== quizIndex));
  };

  //선택지 삭제
  const removeChoice = (quizIndex: number, choiceIndex: number) => {
    const updatedQuizSet = [...quizSet];
    updatedQuizSet[quizIndex].choiceList = updatedQuizSet[quizIndex].choiceList.filter(
      (_, i) => i !== choiceIndex
    );
    setQuizSet(updatedQuizSet);
  };

  //선택지 추가
  const addChoice = (quizIndex: number) => {
    if (quizSet[quizIndex].choiceList.length > 5) return;
    const updatedQuizSet = [...quizSet];
    const newChoiceOrder = updatedQuizSet[quizIndex].choiceList.length + 1;
    updatedQuizSet[quizIndex].choiceList.push({
      choiceContent: '',
      choiceOrder: newChoiceOrder,
      isAnswer: false
    });
    setQuizSet(updatedQuizSet);
  };

  const handleSubmit = async () => {
    // 제목 비어있는지 검사
    if (!title.trim()) {
      setTitleError('제목을 입력해주세요');
      return;
    }

    // 퀴즈 이름 비어있는지 검사
    const emptyQuizIndex = quizSet.findIndex((quiz) => !quiz.quiz.trim());
    if (emptyQuizIndex >= 0) {
      setQuizErrorIndex(emptyQuizIndex);
      return;
    }

    //선택지 비어있는지 검사
    const emptyQuizChoiceIndex = quizSet.findIndex((quiz) =>
      quiz.choiceList.find((choice) => !choice.choiceContent.trim())
    );
    if (emptyQuizChoiceIndex >= 0) {
      const emptyChoiceIndex = quizSet[emptyQuizChoiceIndex].choiceList.findIndex(
        (choice) => !choice.choiceContent.trim()
      );
      setChoiceErrorIndex([emptyQuizChoiceIndex, emptyChoiceIndex]);
      return;
    }

    const quizData: QuizData = { title, category, quizSet };
    const payload: CreateQuizSetPayload = {
      title: quizData.title,
      category: quizData.category,
      quizList: quizData.quizSet // 이름 변경
    };
    console.log('payload:', payload);

    try {
      setIsSubmitting(true); // 로딩 시작
      const response = await createQuizSet(payload);
      if (response) {
        alert('퀴즈셋이 성공적으로 생성되었습니다!');
        // 성공적으로 생성되면 상태 초기화
        setTitle('');
        setCategory('');
        setQuizSet([]);
      } else {
        alert('퀴즈셋 생성에 실패했습니다. 다시 시도해주세요.');
      }
    } catch (error) {
      console.error('Error submitting quiz data:', error);
      alert('퀴즈셋 생성 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false); // 로딩 종료
    }
  };

  useEffect(() => {
    if (quizSet.length === 0) addQuiz();
  }, [quizSet, addQuiz]);

  return (
    <>
      <div className="bg-gradient-to-r from-blue-300 to-indigo-500 min-h-screen flex flex-col items-center justify-center">
        <Header />
        <div className="w-full max-w-lg p-8 bg-white shadow-lg rounded-xl border-4 border-blue-400 mt-14">
          <div className="mb-6 font-bold text-gray-800 text-center pb-4 text-4xl">
            퀴즈셋 생성하기
          </div>

          <TextInput
            label="제목"
            value={title}
            onChange={handleTitleChange}
            error={titleError}
            className="mb-6"
          />
          <Select
            value={category}
            onChange={handleCategoryChange}
            fullWidth
            displayEmpty
            className="mb-6"
          >
            <MenuItem value="" disabled>
              카테고리 설정
            </MenuItem>
            {Object.entries(QuizsetCategory).map(([key, value], i) => (
              <MenuItem key={i} value={key}>
                {value}
              </MenuItem>
            ))}
          </Select>

          {/* 퀴즈 리스트 */}
          {quizSet.map((quiz, quizIndex) => (
            <Box
              key={quizIndex}
              className="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm bg-gray-50 relative"
            >
              {/* 퀴즈 헤더 */}
              <div className="flex justify-between items-center mb-4">
                <div className="font-bold text-blue-600 text-xl">퀴즈 {quizIndex + 1}</div>
                {quizSet.length > 1 && (
                  <button
                    className="text-red-500 hover:text-red-700 transition-all"
                    onClick={() => removeQuiz(quizIndex)}
                  >
                    삭제
                  </button>
                )}
              </div>

              {/* 퀴즈 입력 */}
              <TextInput
                label="퀴즈 내용"
                value={quiz.quiz}
                onChange={(e) => handleQuizChange(quizIndex, e.target.value)}
                error={quizErrorIndex === quizIndex ? '퀴즈를 입력해주세요.' : ''}
                className="mb-4"
              />

              {/* 제한 시간 */}
              <TextField
                label="제한 시간 (초)"
                type="number"
                variant="outlined"
                value={quiz.limitTime || 10}
                onChange={(e) => handleLimitTimeChange(quizIndex, e.target.value)}
                className="mb-6 w-full"
              />
              <div className="">
                {/* 선택지 추가 버튼 */}
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-bold text-blue-500">선택지</span>
                  <CustomButton
                    text="선택지 추가"
                    onClick={() => addChoice(quizIndex)}
                    size="third"
                    color="green"
                  />
                </div>
                {/* 선택지 입력 */}
                <Box className="space-y-2 max-h-60 overflow-y-auto  p-4 rounded-lg border">
                  {quiz.choiceList.map((choice, choiceIndex) => (
                    <Box key={choiceIndex} className="flex items-center gap-4">
                      <button
                        className={`text-xl ${choice.isAnswer ? 'text-green-500' : 'text-gray-400'}`}
                        onClick={() =>
                          handleChoiceChange(quizIndex, choiceIndex, 'isAnswer', 'true')
                        }
                      >
                        {choice.isAnswer ? '정답' : '오답'}
                      </button>
                      <TextInput
                        label={`선택지 ${choiceIndex + 1}`}
                        value={choice.choiceContent}
                        onChange={(e) =>
                          handleChoiceChange(
                            quizIndex,
                            choiceIndex,
                            'choiceContent',
                            e.target.value
                          )
                        }
                        error={
                          choiceErrorIndex &&
                          quizIndex === choiceErrorIndex[0] &&
                          choiceIndex === choiceErrorIndex[1]
                            ? '선택지를 입력해주세요.'
                            : ''
                        }
                        className="flex-1"
                      />
                      {quiz.choiceList.length > 2 && !choice.isAnswer && (
                        <button
                          className="text-red-500 hover:text-red-700 transition-all"
                          onClick={() => removeChoice(quizIndex, choiceIndex)}
                        >
                          ✕
                        </button>
                      )}
                    </Box>
                  ))}
                </Box>
              </div>
            </Box>
          ))}

          {/* 퀴즈 추가/제출 버튼 */}
          <CustomButton text="퀴즈 추가" onClick={addQuiz} className="w-full" color="yellow" />
          <CustomButton text="퀴즈셋 생성하기" onClick={handleSubmit} className="w-full" />
        </div>
      </div>
    </>
  );
};
