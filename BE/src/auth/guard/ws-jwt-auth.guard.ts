import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Socket } from 'socket.io';
import { JwtStrategy } from './jwt.strategy';

@Injectable()
export class WsJwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly jwtStrategy: JwtStrategy
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const client: Socket = context.switchToWs().getClient<Socket>();
    const token = client.handshake.headers['authorization']?.split(' ')[1]; // 'Bearer {token}'에서 토큰만 추출
    if (!token) {
      return true;
    }

    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET || 'SECRET_KEY'
      });
      const user = await this.jwtStrategy.validate(payload);
      if (!user) {
        return true;
      }
      client.data.user = user;
    } catch (err) {}
    return true;
  }
}
