import { Type } from 'class-transformer';
import { IsString, IsNumber, ValidateNested, IsArray, IsBoolean, IsObject } from 'class-validator';

export class PagingDto {
  @IsString()
  nextCursor: string | null;

  @IsBoolean()
  hasNextPage: boolean;
}

export class QuizSetListResponseDto {
  @ValidateNested({ each: true })
  @Type(() => QuizSetDto)
  @IsArray()
  quizSetList: QuizSetDto[];

  @ValidateNested()
  @Type(() => PagingDto)
  @IsObject()
  paging: PagingDto;

  constructor(quizSetList: QuizSetDto[], nextCursor: string | null, hasNextPage: boolean) {
    this.quizSetList = quizSetList;
    this.paging = {
      nextCursor,
      hasNextPage
    };
  }
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

export class ChoiceDto {
  @IsString()
  content: string;

  @IsNumber()
  order: number;
}
