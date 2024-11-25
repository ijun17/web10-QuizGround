import { useCallback, useEffect, useState } from 'react';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
  Typography,
  SelectChangeEvent
} from '@mui/material';
import { HeaderBar } from '@/components/HeaderBar';
import { TextInput } from '@/components/TextInput';
import { createQuizSet } from '@/api/rest/quizApi';
import { CreateQuizSetPayload } from '@/api/rest/quizTypes';
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
    updatedQuizSet[index].limitTime = Math.min(60, Math.max(1, newLimitTime));
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
        choiceList: [{ choiceContent: '', choiceOrder: 1, isAnswer: true }]
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
      <HeaderBar />
      <Box className="p-8 max-w-3xl mx-auto bg-white shadow-xl rounded-lg">
        <Typography variant="h4" className="mb-6 font-semibold text-gray-800 pb-4 text-center">
          퀴즈셋 생성하기
        </Typography>

        <TextInput label="제목" value={title} onChange={handleTitleChange} error={titleError} />

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
          <MenuItem value="history">역사</MenuItem>
          <MenuItem value="computer">컴퓨터</MenuItem>
          <MenuItem value="science">과학</MenuItem>
        </Select>

        {quizSet.map((quiz, quizIndex) => (
          <Box key={quizIndex} className="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm ">
            <div className="flex justify-between">
              <Typography variant="h6" className="mb-4 p-2 font-semibold">
                퀴즈 {quizIndex + 1}
              </Typography>
              {quizSet.length > 1 && (
                <button className="text-red-500" onClick={() => removeQuiz(quizIndex)}>
                  삭제
                </button>
              )}
            </div>

            <TextInput
              label="퀴즈"
              value={quiz.quiz}
              onChange={(e) => handleQuizChange(quizIndex, e.target.value)}
              error={quizErrorIndex === quizIndex ? '퀴즈를 입력해주세요' : ''}
            />
            <TextField
              label="제한 시간 (초)"
              type="number"
              variant="outlined"
              fullWidth
              className="mb-6"
              value={quiz.limitTime || 10}
              onChange={(e) => handleLimitTimeChange(quizIndex, e.target.value)}
            />
            <Box className="m-2">
              {quiz.choiceList.map((choice, choiceIndex) => (
                <TextInput
                  key={choiceIndex}
                  label={`선택지 ${choiceIndex + 1}`}
                  value={choice.choiceContent}
                  onChange={(e) =>
                    handleChoiceChange(quizIndex, choiceIndex, 'choiceContent', e.target.value)
                  }
                  error={
                    choiceErrorIndex &&
                    quizIndex === choiceErrorIndex[0] &&
                    choiceIndex === choiceErrorIndex[1]
                      ? '선택지를 입력해주세요'
                      : ''
                  }
                >
                  <button
                    className="text-[2rem] transition transform duration-100 ease-in-out active:scale-75"
                    onClick={() => handleChoiceChange(quizIndex, choiceIndex, 'isAnswer', 'true')}
                  >
                    {choice.isAnswer ? '✅' : '⬜'}
                  </button>
                  <button
                    className={'text-[2rem] w-12 center text-red-500'}
                    style={{ visibility: choice.isAnswer ? 'hidden' : 'visible' }}
                    onClick={() => removeChoice(quizIndex, choiceIndex)}
                  >
                    ✕
                  </button>
                </TextInput>
              ))}
            </Box>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => addChoice(quizIndex)}
              className="w-full mb-4"
              style={{ display: quiz.choiceList.length > 5 ? 'none' : 'block' }}
            >
              선택지 추가
            </Button>
          </Box>
        ))}

        <Button variant="outlined" color="secondary" onClick={addQuiz} className="w-full mb-6">
          퀴즈 추가
        </Button>
        <Button variant="contained" color="primary" onClick={handleSubmit} className="w-full">
          퀴즈 데이터 제출
        </Button>
      </Box>
    </>
  );
};
