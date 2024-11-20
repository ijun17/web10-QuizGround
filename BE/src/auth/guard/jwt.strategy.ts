import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthService } from '../auth.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY'
    });
  }

  async validate(payload: any) {
    console.log(`TEST VALIDATE ${payload}`);
    const user = await this.authService.validateUserInJwt(payload.sub, payload.username);
    if (!user) {
      throw new UnauthorizedException('잘못된 토큰입니다.');
    }
    return user;
  }
}
