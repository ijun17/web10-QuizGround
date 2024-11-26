import { io, Socket } from 'socket.io-client';

export class SocketTestHelper {
  private clients: Socket[] = [];

  async connectClients(port: number, count: number): Promise<Socket[]> {
    await this.disconnectAll(); // 기존 연결이 있다면 정리

    return new Promise<Socket[]>((resolve) => {
      let connectedClients = 0;
      const onConnect = () => {
        connectedClients++;
        if (connectedClients === count) {
          resolve(this.clients);
        }
      };

      for (let i = 0; i < count; i++) {
        const client = io(`http://localhost:${port}/game`, {
          transports: ['websocket'],
          forceNew: true
        });
        client.on('connect', onConnect);
        this.clients.push(client);
      }
    });
  }

  async disconnectAll() {
    for (const client of this.clients) {
      if (client && client.connected) {
        client.disconnect();
      }
    }
    this.clients = [];
  }

  getClient(index: number): Socket {
    if (index < 0 || index >= this.clients.length) {
      throw new Error(`Invalid client index: ${index}`);
    }
    return this.clients[index];
  }
}