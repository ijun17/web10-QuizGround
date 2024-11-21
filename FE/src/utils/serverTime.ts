let offset = 0;
let offsetTotal = 0;
let offsetCount = 0;
let lastSyncTimestamp = 0;
const SYNC_DELAY = 10000;
const API_PATH = '/api/time';

const syncServerTimestamp = () => {
  if (lastSyncTimestamp + SYNC_DELAY > Date.now()) return;
  lastSyncTimestamp = Date.now();
  const startClientTime = Date.now();
  fetch(API_PATH)
    .then((res) => res.json())
    .then((res) => {
      const endClientTime = Date.now();
      const clientTime = (startClientTime + endClientTime) / 2;
      offsetTotal += clientTime - res.serverTime;
      offsetCount++;
      offset = Math.floor(offsetTotal / offsetCount);
    });
};

syncServerTimestamp();

export const getServerTimestamp = () => {
  syncServerTimestamp();
  return Date.now() - offset;
};
