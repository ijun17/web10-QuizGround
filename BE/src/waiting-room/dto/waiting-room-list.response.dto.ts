export class RoomDto {
  title: string;
  gameMode: string;
  maxPlayerCount: number;
  currentPlayerCount: number;
  quizSetTitle: string;
  gameId: string;
}

export class RoomListResponseDto {
  roomList: RoomDto[];
}