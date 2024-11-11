import { Module } from '@nestjs/common';
import { QuizService } from './quiz.service';
import { QuizController } from './quiz.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizSetModel } from './entities/quiz-set.entity';
import { QuizModel } from './entities/quiz.entity';
import { QuizChoiceModel } from './entities/quiz-choice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuizSetModel, QuizModel, QuizChoiceModel]),
    UserModule // 필요한 다른 모듈 import
  ],
  controllers: [QuizController],
  providers: [QuizService],
  exports: [QuizService]
})
export class QuizModule {}
