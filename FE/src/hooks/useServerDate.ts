import { useCallback, useEffect, useState } from 'react';

const API_PATH = '/api/time';

const useServerDate = () => {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    const startClientTime = Date.now();
    fetch(API_PATH)
      .then((res) => res.json())
      .then((res) => {
        const endClientTime = Date.now();
        const clientTime = (startClientTime + endClientTime) / 2;
        setOffset(clientTime - res.serverTime);
      });
  }, []);
  const now = useCallback(() => Date.now() + offset, [offset]);
  return now;
};

export default useServerDate;
