import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModel } from '../user/entities/user.entity';
import { UserQuizArchiveModel } from '../user/entities/user-quiz-archive.entity';
import { InitDbService } from './InitDb.Service';
import { QuizModel } from '../quiz/entities/quiz.entity';
import { QuizSetModel } from '../quiz/entities/quiz-set.entity';
import { InitDbController } from './initDB.controller';
import { QuizChoiceModel } from '../quiz/entities/quiz-choice.entity';

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
  controllers: [InitDbController],
  providers: [InitDbService],
  exports: [InitDbService]
})
export class InitDbModule {}
