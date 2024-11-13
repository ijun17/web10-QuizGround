// export class CreateQuizSetDto extends PickType(QuizSetModel, ['title', 'category', 'quizList']) {}
//
// export class CreateQuizDto extends PickType(QuizModel, ['quiz', 'limitTime', 'choiceList']) {}
//
// export class CreateChoiceDto extends PickType(QuizChoiceModel, [
//   'choiceContent',
//   'choiceOrder',
//   'isAnswer'
// ]) {}
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsNumber,
  IsString,
  Max,
  Min,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class CreateChoiceDto {
  @IsString()
  choiceContent: string;

  @IsNumber()
  @Min(1)
  @Max(10)
  choiceOrder: number;

  @IsBoolean()
  isAnswer: boolean;
}

export class CreateQuizDto {
  @IsString()
  quiz: string;

  @IsNumber()
  @Min(10)
  @Max(3600)
  limitTime: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateChoiceDto)
  @ArrayMinSize(2)
  choiceList: CreateChoiceDto[];
}

export class CreateQuizSetDto {
  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateQuizDto)
  @ArrayMinSize(1)
  quizList: CreateQuizDto[];
}
