import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>
  ) {}

  async create(createUserDto: CreateUserDto) {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    const newUser = this.userRepository.create({
      email: createUserDto.email,
      password: hashedPassword,
      nickname: createUserDto.nickname,
      status: '?'
    });
    return this.userRepository.save(newUser);
  }

  findAll() {
    return 'This action returns all user';
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

  update(email: string, updateUserDto: UpdateUserDto) {
    return `This action updates a ${email} user`;
  }

  remove(email: string) {
    return `This action removes a ${email} user`;
  }
}
