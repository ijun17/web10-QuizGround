import { Type } from 'class-transformer';
import { IsString, IsNumber, ValidateNested, IsArray } from 'class-validator';

export class QuizSetList<T> {
  constructor(data: T) {
    this.quizSetList = data;
  }

  quizSetList: T;
}

export class ChoiceDto {
  @IsString()
  content: string;

  @IsNumber()
  order: number;
}

export class QuizDto {
  @IsString()
  id: string;

  @IsString()
  quiz: string;

  @IsNumber()
  limitTime: number;

  @ValidateNested({ each: true })
  @Type(() => ChoiceDto)
  @IsArray()
  choiceList: ChoiceDto[];
}

export class QuizSetDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsString()
  category: string;

  @IsNumber()
  quizCount: number;
}