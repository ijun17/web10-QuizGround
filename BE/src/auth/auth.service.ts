import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UserModel } from '../user/entities/user.entity';
import * as bcrypt from 'bcrypt';
import { SignupDto } from './dto/signup.dto';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService
  ) {}

  async validateUserInLocal(email: string, password: string) {
    const user = await this.userService.findOne(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      return user;
    }
    return null;
  }

  async validateUserInJwt(id: number, email: string) {
    const user = await this.userService.findOne(email);
    if (user && user.id === id) {
      return user;
    }
    return null;
  }

  async login(user: UserModel) {
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload)
    };
  }

  async signup(signupDto: SignupDto) {
    const user = await this.userService.create(signupDto);
    if (user) {
      return user;
    }
    return null;
  }
}
