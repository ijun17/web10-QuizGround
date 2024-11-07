import { ArrayMaxSize, ArrayMinSize, IsArray, IsNumber, IsString, Length } from 'class-validator';

export class UpdatePositionDto {
  @IsString()
  @Length(6, 6, { message: 'PIN번호는 6자리이어야 합니다.' })
  gameId: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(2)
  @IsNumber({}, { each: true })
  newPosition: [number, number];
}
