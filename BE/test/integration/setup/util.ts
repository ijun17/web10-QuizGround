import socketEvents from '../../../src/common/constants/socket-events';
import * as net from 'node:net';

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

export async function getAvailablePort(startPort = 3000): Promise<number> {
  const port = startPort;
  try {
    const server = net.createServer();
    return new Promise((resolve, reject) => {
      server.listen(port, () => {
        server.once('close', () => {
          resolve(port);
        });
        server.close();
      });
      server.on('error', (err: NodeJS.ErrnoException) => {
        if (err.code === 'EADDRINUSE') {
          resolve(getAvailablePort(port + 1));
        } else {
          reject(err);
        }
      });
    });
  } catch (err) {
    return getAvailablePort(port + 1);
  }
}