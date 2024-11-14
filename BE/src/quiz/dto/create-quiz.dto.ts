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
  choiceOrder: number;

  @IsBoolean()
  isAnswer: boolean;
}

export class CreateQuizDto {
  @IsString()
  quiz: string;

  @IsNumber()
  @Min(1)
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
