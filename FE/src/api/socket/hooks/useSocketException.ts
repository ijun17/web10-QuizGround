import { useCallback, useEffect } from 'react';
import { SocketDataMap } from '../socketEventTypes';
import { socketService } from '../socket';

type SocketEvent = keyof SocketDataMap;

export const useSocketException = (eventName: SocketEvent, callback: (message: string) => void) => {
  const fn = useCallback(
    (data: SocketDataMap['exception']['response']) => {
      if (data.eventName === eventName) callback(data.message);
    },
    [eventName, callback]
  );

  useEffect(() => {
    socketService.on('exception', fn);
    return () => socketService.off('exception', fn);
  }, [fn]);
};
