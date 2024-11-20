import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { JwtStrategy } from './guard/jwt.strategy';
import { LocalStrategy } from './guard/local.strategy';
import { ConfigModule } from '@nestjs/config';
import { WsJwtAuthGuard } from './guard/ws-jwt-auth.guard';
import { JwtAuthGuard } from './guard/jwt-auth.guard';

@Module({
  imports: [
    UserModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        secret: process.env.JWT_SECRET || 'SECRET_KEY',
        signOptions: { expiresIn: '1d' }
      })
    })
  ],
  providers: [AuthService, LocalStrategy, JwtStrategy, JwtAuthGuard, WsJwtAuthGuard],
  controllers: [AuthController],
  exports: [JwtAuthGuard, WsJwtAuthGuard]
})
export class AuthModule {}
