import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from '../user/entities/user.entity';
import { UserQuizArchiveModel } from '../user/entities/user-quiz-archive.entity';
import { InitDBService } from './InitDB.Service';
import { QuizModel } from '../quiz-set/entities/quiz.entity';
import { QuizSetModel } from '../quiz-set/entities/quiz-set.entity';
import { InitDBController } from './InitDB.controller';
import { QuizChoiceModel } from '../quiz-set/entities/quiz-choice.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserModel,
      QuizModel,
      QuizSetModel,
      QuizChoiceModel,
      UserQuizArchiveModel
    ])
  ],
  controllers: [InitDBController],
  providers: [InitDBService],
  exports: [InitDBService]
})
export class InitDBModule {}
