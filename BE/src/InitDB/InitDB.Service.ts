import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { QuizSetModel } from '../quiz/entities/quiz-set.entity';
import { QuizModel } from '../quiz/entities/quiz.entity';
import { QUIZ_SET_TEST_DATA } from './QUIZ_SET_TEST_DATA';
import { QuizChoiceModel } from '../quiz/entities/quiz-choice.entity';
import { UserModel } from '../user/entities/user.entity';

/**
 * Quiz Set Type Definitions
 */
export interface QuizSetData {
  title: string;
  category: string;
  quizList: QuizData[];
}

export interface QuizData {
  quiz: string;
  limitTime: number;
  choiceList: ChoiceData[];
}

export interface ChoiceData {
  content: string;
  order: number;
  isAnswer: boolean;
}

/**
 * Seed Service Implementation
 */
@Injectable()
export class InitDBService {
  constructor(
    @InjectRepository(QuizSetModel)
    private readonly quizSetRepository: Repository<QuizSetModel>,
    @InjectRepository(QuizModel)
    private readonly quizRepository: Repository<QuizModel>,
    @InjectRepository(QuizChoiceModel)
    private readonly choiceRepository: Repository<QuizChoiceModel>,
    @InjectRepository(UserModel)
    private readonly userRepository: Repository<UserModel>,
    private readonly dataSource: DataSource
  ) {}

  async create(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create User
      let user = queryRunner.manager.create(UserModel, {
        email: 'honux@codesquad.co.kr',
        nickname: 'honux',
        password: '123456',
        status: 'ACTIVE',
        point: 100
      });
      const findUser = await this.userRepository.findOne({
        where: { email: user.email }
      });
      if (!findUser) {
        await this.userRepository.save(user);
      } else {
        user = findUser;
      }

      for (const quizSetData of QUIZ_SET_TEST_DATA) {
        // 2. Create QuizSet
        const quizSet = queryRunner.manager.create(QuizSetModel, {
          user,
          title: quizSetData.title,
          category: quizSetData.category
        });
        await queryRunner.manager.save(quizSet);

        // 3. Create Quizzes
        for (const quizData of quizSetData.quizList) {
          const quiz = queryRunner.manager.create(QuizModel, {
            quizSet,
            quiz: quizData.quiz,
            limitTime: quizData.limitTime
          });
          await queryRunner.manager.save(quiz);

          // 4. Create Choices
          const choices = quizData.choiceList.map((choiceData) =>
            queryRunner.manager.create(QuizChoiceModel, {
              quiz,
              choiceContent: choiceData.content,
              choiceOrder: choiceData.order,
              isAnswer: choiceData.isAnswer
            })
          );
          await queryRunner.manager.save(choices);
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      console.error('Seeding failed:', error);
      await queryRunner.rollbackTransaction();
      throw new Error(`Failed to seed database: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }
}
