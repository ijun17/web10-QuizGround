import { useState } from 'react';
import {
  TextField,
  Button,
  Select,
  MenuItem,
  Box,
  Typography,
  SelectChangeEvent
} from '@mui/material';
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
  content: string;
  order: number;
  isAnswer: boolean;
};

type Quiz = {
  quiz: string;
  limitTime: number;
  choices: Choice[];
};

type QuizData = {
  title: string;
  category: string;
  quizSet: Quiz[];
};

export const QuizSetupPage: React.FC = () => {
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [quizSet, setQuizSet] = useState<Quiz[]>([
    { quiz: '', limitTime: 0, choices: [{ content: '', order: 1, isAnswer: false }] }
  ]);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value);
  const handleCategoryChange = (e: SelectChangeEvent<string>) => {
    setCategory(e.target.value);
  };

  const handleQuizChange = (index: number, value: string) => {
    const updatedQuizSet = [...quizSet];
    updatedQuizSet[index].quiz = value;
    setQuizSet(updatedQuizSet);
  };

  const handleLimitTimeChange = (index: number, value: string) => {
    const updatedQuizSet = [...quizSet];
    updatedQuizSet[index].limitTime = parseInt(value, 10);
    setQuizSet(updatedQuizSet);
  };

  const handleChoiceChange = (
    quizIndex: number,
    choiceIndex: number,
    field: keyof Choice,
    value: string
  ) => {
    const updatedQuizSet = [...quizSet];
    if (field === 'isAnswer') {
      (updatedQuizSet[quizIndex].choices[choiceIndex][field] as boolean) = value === 'true';
    } else {
      (updatedQuizSet[quizIndex].choices[choiceIndex][field] as string) = value;
    }
    setQuizSet(updatedQuizSet);
  };
  const addQuiz = () => {
    setQuizSet([
      ...quizSet,
      { quiz: '', limitTime: 0, choices: [{ content: '', order: 1, isAnswer: false }] }
    ]);
  };

  const addChoice = (quizIndex: number) => {
    const updatedQuizSet = [...quizSet];
    const newChoiceOrder = updatedQuizSet[quizIndex].choices.length + 1;
    updatedQuizSet[quizIndex].choices.push({ content: '', order: newChoiceOrder, isAnswer: false });
    setQuizSet(updatedQuizSet);
  };

  const handleSubmit = () => {
    const quizData: QuizData = { title, category, quizSet };
    console.log('Quiz Data:', quizData);
    // POST 요청
    // fetch "/api/quizset"
  };

  return (
    <Box className="p-8 max-w-3xl mx-auto bg-white shadow-xl rounded-lg">
      <Typography variant="h4" className="mb-6 font-semibold text-gray-800 pb-4 text-center">
        퀴즈셋 생성하기
      </Typography>

      <TextField
        label="제목"
        variant="outlined"
        fullWidth
        className="mb-6"
        value={title}
        onChange={handleTitleChange}
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
        <MenuItem value="history">역사</MenuItem>
        <MenuItem value="computer">컴퓨터</MenuItem>
        <MenuItem value="science">과학</MenuItem>
      </Select>

      {quizSet.map((quiz, quizIndex) => (
        <Box key={quizIndex} className="mb-8 p-6 border border-gray-200 rounded-lg shadow-sm ">
          <Typography variant="h6" className="mb-4 p-2 font-semibold">
            퀴즈 {quizIndex + 1}
          </Typography>
          <TextField
            label="퀴즈 질문"
            variant="outlined"
            fullWidth
            className="mb-6"
            value={quiz.quiz}
            onChange={(e) => handleQuizChange(quizIndex, e.target.value)}
          />
          <TextField
            label="제한 시간 (초)"
            type="number"
            variant="outlined"
            fullWidth
            className="mb-6"
            value={quiz.limitTime || 0}
            onChange={(e) => handleLimitTimeChange(quizIndex, e.target.value)}
          />
          {quiz.choices.map((choice, choiceIndex) => (
            <Box key={choiceIndex} className="flex items-center mb-6">
              <TextField
                label={`선택지 ${choiceIndex + 1}`}
                variant="outlined"
                className="flex-grow mr-4"
                value={choice.content}
                onChange={(e) =>
                  handleChoiceChange(quizIndex, choiceIndex, 'content', e.target.value)
                }
              />
              <Select
                value={choice.isAnswer.toString()}
                onChange={(e) =>
                  handleChoiceChange(quizIndex, choiceIndex, 'isAnswer', e.target.value)
                }
                className="w-28"
              >
                <MenuItem value="false">정답아님</MenuItem>
                <MenuItem value="true">정답</MenuItem>
              </Select>
            </Box>
          ))}
          <Button
            variant="outlined"
            color="primary"
            onClick={() => addChoice(quizIndex)}
            className="w-full mb-4"
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
  );
};
