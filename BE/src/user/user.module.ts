import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from './entities/user.entity';
import { UserQuizArchiveModel } from './entities/user-quiz-archive.entity';

@Module({
  imports: [TypeOrmModule.forFeature([UserModel, UserQuizArchiveModel])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService]
})
export class UserModule {}
