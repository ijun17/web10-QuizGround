import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import * as bcrypt from 'bcrypt';
import { SignupDto } from '../auth/dto/signup.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>
  ) {}

  async create(signupDto: SignupDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(signupDto.password, salt);
    const newUser = this.userRepository.create({
      email: signupDto.email,
      password: hashedPassword,
      nickname: signupDto.nickname,
      status: '?'
    });
    return this.userRepository.save(newUser);
  }

  async findOne(email: string) {
    const user = await this.userRepository.findOne({
      where: { email }
    });
    if (!user) {
      return null;
    }
    return user;
  }
}
