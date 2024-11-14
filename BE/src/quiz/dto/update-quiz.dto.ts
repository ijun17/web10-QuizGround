import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateChoiceDto {
  @IsString()
  @IsOptional()
  choiceContent?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(10)
  choiceOrder?: number;

  @IsBoolean()
  @IsOptional()
  isAnswer?: boolean;
}

export class UpdateQuizDto {
  @IsString()
  @IsOptional()
  quiz?: string;

  @IsNumber()
  @IsOptional()
  @Min(10)
  @Max(3600)
  limitTime?: number;

  @ValidateNested({ each: true })
  @Type(() => UpdateChoiceDto)
  @IsOptional()
  choiceList?: UpdateChoiceDto[];
}

export class UpdateQuizSetDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  category?: string;

  @ValidateNested({ each: true })
  @Type(() => UpdateQuizDto)
  @IsOptional()
  quizList?: UpdateQuizDto[];
}
