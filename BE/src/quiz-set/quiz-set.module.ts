import { Module } from '@nestjs/common';
import { QuizSetService } from './service/quiz-set.service';
import { QuizSetController } from './quiz-set.controller';
import { UserModule } from '../user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizSetModel } from './entities/quiz-set.entity';
import { QuizModel } from './entities/quiz.entity';
import { QuizChoiceModel } from './entities/quiz-choice.entity';
import { QuizSetCreateService } from './service/quiz-set-create.service';
import { QuizSetDeleteService } from './service/quiz-set-delete.service';
import { QuizSetReadService } from './service/quiz-set-read.service';
import { QuizSetUpdateService } from './service/quiz-set-update.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([QuizSetModel, QuizModel, QuizChoiceModel]),
    UserModule,
    AuthModule
  ],
  controllers: [QuizSetController],
  providers: [
    QuizSetService,
    QuizSetCreateService,
    QuizSetReadService,
    QuizSetUpdateService,
    QuizSetDeleteService
  ],
  exports: [
    QuizSetService,
    QuizSetCreateService,
    QuizSetReadService,
    QuizSetUpdateService,
    QuizSetDeleteService
  ]
})
export class QuizSetModule {}
