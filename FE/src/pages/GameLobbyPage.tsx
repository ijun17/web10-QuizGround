import { HeaderBar } from '@/components/HeaderBar';
import { LobbyList } from '@/components/LobbyList';
import { useState, useEffect, useCallback } from 'react';
import { getRoomList } from '@/api/rest/roomApi';

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

export const GameLobbyPage = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [paging, setPaging] = useState<Paging | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const loadRooms = useCallback(
    async (cursor: string | null, take: number = 10) => {
      if (isLoading) return;

      setIsLoading(true);
      const response = await getRoomList(cursor ?? '', take);

      if (response) {
        setRooms((prevRooms) => [...prevRooms, ...response.roomList]);
        setPaging(response.paging);
      }

      setIsLoading(false);
    },
    [isLoading]
  );

  useEffect(() => {
    loadRooms(null);
  }, [loadRooms]);

  const handleScroll = useCallback(() => {
    if (!paging?.hasNextPage) return;

    const { scrollTop, scrollHeight, clientHeight } = document.documentElement;
    if (scrollHeight - scrollTop <= clientHeight + 200) {
      loadRooms(paging?.nextCursor); // 스크롤 시 추가 데이터 요청
    }
  }, [paging, loadRooms]);

  useEffect(() => {
    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  return (
    <div>
      <HeaderBar />
      <LobbyList rooms={rooms} />
      {isLoading && <div className="text-center mt-4">Loading...</div>}
    </div>
  );
};
