import { IsString } from 'class-validator';

export class SetPlayerNameDto {
  @IsString()
  playerName: string;
}
