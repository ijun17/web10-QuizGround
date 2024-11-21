import axiosInstance from './instance';

type Room = {
  title: string;
  gameMode: string;
  maxPlayerCount: number;
  currentPlayerCount: number;
  quizSetTitle: string;
  gameId: string;
};

type Paging = {
  nextCursor: string;
  hasNextPage: boolean;
};

type RoomListResponse = {
  roomList: Room[];
  paging: Paging;
};
// 대기방 목록 조회
export async function getRoomList(cursor: string, take: number): Promise<RoomListResponse | null> {
  try {
    const params = { cursor, take };
    const response = await axiosInstance.get<RoomListResponse>('/api/rooms', { params });

    return response.data;
  } catch (error) {
    console.error('Error fetching room list:', error);
    return null;
  }
}

type TimeResponse = {
  serverTime: number;
};
// 서버 시간 요청
export async function getServerTime(): Promise<TimeResponse | null> {
  try {
    const response = await axiosInstance.get<TimeResponse>('/api/time');
    return response.data;
  } catch (error) {
    console.error('Error fetching server time:', error);
    return null;
  }
}
