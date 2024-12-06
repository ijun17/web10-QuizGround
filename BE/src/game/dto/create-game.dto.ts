import { IsIn, IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { Transform, Type } from 'class-transformer';
import { WsException } from '@nestjs/websockets';
import { GameMode } from '../../common/constants/game';

export class CreateGameDto {
  @IsString()
  @MinLength(1, { message: '제목은 최소 1자 이상이어야 합니다' })
  @MaxLength(20, { message: '제목은 최대 20자까지 가능합니다' })
  title: string;

  @IsString()
  @IsIn([GameMode.RANKING, GameMode.SURVIVAL])
  gameMode: string;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(300)
  maxPlayerCount: number;

  @Transform(({ value }) => {
    if (value === undefined) {
      return true;
    } // 기본값 설정
    if (typeof value === 'boolean') {
      return value;
    }
    if (value === 'true' || value === '1' || value === 1) {
      return true;
    }
    if (value === 'false' || value === '0' || value === 0) {
      return false;
    }
    throw new WsException({
      status: 'error',
      message: '잘못된 boolean 값입니다'
    });
  })
  isPublic: boolean;
}
