import { Socket } from 'socket.io';

export function ValidateRoom() {
  return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
    const originalMethod = descriptor.value;

    descriptor.value = function (...args: any[]) {
      const client: Socket = args[1];
      const room = this.rooms.get(args[0].gameId);

      if (!room) {
        client.emit('error', '[ERROR] 존재하지 않는 게임 방입니다.');
        return;
      }

      return originalMethod.apply(this, args);
    };

    return descriptor;
  };
}
