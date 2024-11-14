import { IsInt, IsString, Length } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateRoomQuizsetDto {
  @IsString()
  @Length(6, 6, { message: 'PIN번호는 6자리이어야 합니다.' })
  gameId: string;

  @Type(() => Number)
  @IsInt()
  quizSetId: number;

  @Type(() => Number)
  @IsInt()
  quizCount: number;
}
