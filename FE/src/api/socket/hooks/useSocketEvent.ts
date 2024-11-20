import { useEffect } from 'react';
import { SocketDataMap } from '../socketEventTypes';
import { socketService } from '../socket';

type SocketEvent = keyof SocketDataMap;

export const useSocketEvent = <T extends SocketEvent>(
  eventName: T,
  callback: (data: SocketDataMap[T]['response']) => void
) => {
  useEffect(() => {
    socketService.on(eventName, callback);
    return () => socketService.off(eventName, callback);
  }, [eventName, callback]);
};
