import socketEvents from '../../../src/common/constants/socket-events';

export async function createRoom(client) {
  const createResponse = await new Promise<{ gameId: string }>((resolve) => {
    client.once(socketEvents.CREATE_ROOM, resolve);
    client.emit(socketEvents.CREATE_ROOM, {
      title: 'Test Room',
      gameMode: 'RANKING',
      maxPlayerCount: 5,
      isPublic: true
    });
  });
  return createResponse;
}

export async function joinRoom(client, gameId) {
  const joinResponse = await new Promise<any>((resolve) => {
    client.once(socketEvents.JOIN_ROOM, resolve);
    client.emit(socketEvents.JOIN_ROOM, {
      gameId: gameId,
      playerName: 'TestPlayer'
    });
  });
  return joinResponse;
}