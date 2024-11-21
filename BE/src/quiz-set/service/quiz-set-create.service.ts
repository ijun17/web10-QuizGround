import { BadRequestException, Injectable, InternalServerErrorException } from '@nestjs/common';
import { DataSource, EntityManager, QueryFailedError } from 'typeorm';
import { UserModel } from '../../user/entities/user.entity';
import { CreateChoiceDto, CreateQuizDto, CreateQuizSetDto } from '../dto/create-quiz.dto';
import { QuizSetModel } from '../entities/quiz-set.entity';
import { QuizModel } from '../entities/quiz.entity';
import { QuizChoiceModel } from '../entities/quiz-choice.entity';

@Injectable()
export class QuizSetCreateService {
  constructor(private dataSource: DataSource) {}

  /**
   * 퀴즈셋, 퀴즈, 선택지를 생성합니다.
   * @param createQuizSetDto 생성할 퀴즈셋 데이터
   * @param user 생성하는 유저
   * @returns 생성된 퀴즈셋
   */
  async createQuizSet(dto: CreateQuizSetDto, user: UserModel) {
    this.validateQuizSet(dto);
    return this.dataSource
      .transaction(async (manager) => {
        const quizSet = await this.createQuizSetEntity(manager, dto, user);
        await this.createQuizzesWithChoices(manager, dto.quizList, quizSet);

        return {
          id: quizSet.id
        };
      })
      .catch(this.handleError);
  }

  private async createQuizSetEntity(
    manager: EntityManager,
    dto: CreateQuizSetDto,
    user: UserModel
  ): Promise<QuizSetModel> {
    const quizSet = manager.create(QuizSetModel, {
      title: dto.title,
      category: dto.category,
      userId: user.id
    });

    return manager.save(quizSet);
  }

  private async createQuizzesWithChoices(
    manager: EntityManager,
    quizList: CreateQuizDto[],
    quizSet: QuizSetModel
  ): Promise<void> {
    await Promise.all(
      quizList.map(async (quizData) => {
        const quiz = await this.createQuiz(manager, quizData, quizSet);
        await this.createChoices(manager, quizData.choiceList, quiz);
      })
    );
  }

  private async createQuiz(
    manager: EntityManager,
    quizData: CreateQuizDto,
    quizSet: QuizSetModel
  ): Promise<QuizModel> {
    const quiz = manager.create(QuizModel, {
      quizSet,
      quiz: quizData.quiz,
      limitTime: quizData.limitTime
    });

    return manager.save(quiz);
  }

  private async createChoices(
    manager: EntityManager,
    choiceList: CreateChoiceDto[],
    quiz: QuizModel
  ): Promise<void> {
    const choices = choiceList.map((choice) =>
      manager.create(QuizChoiceModel, {
        quiz,
        choiceContent: choice.choiceContent,
        choiceOrder: choice.choiceOrder,
        isAnswer: choice.isAnswer
      })
    );

    await manager.save(choices);
  }

  private validateQuizSet(quizSet: CreateQuizSetDto): void {
    for (const quiz of quizSet.quizList) {
      this.validateQuizAnswers(quiz);
      this.validateChoiceOrders(quiz);
    }
  }

  private validateQuizAnswers(quiz: CreateQuizDto): void {
    const hasAnswer = quiz.choiceList.some((choice) => choice.isAnswer);
    if (!hasAnswer) {
      throw new BadRequestException(`퀴즈 "${quiz.quiz}"에 정답이 없습니다.`);
    }
  }

  private validateChoiceOrders(quiz: CreateQuizDto): void {
    const orders = new Set(quiz.choiceList.map((choice) => choice.choiceOrder));
    if (orders.size !== quiz.choiceList.length) {
      throw new BadRequestException(`퀴즈 "${quiz.quiz}"의 선택지 번호가 중복됩니다.`);
    }
  }

  private handleError(error: Error): never {
    if (error instanceof BadRequestException) {
      throw error;
    }
    if (error instanceof QueryFailedError) {
      throw new BadRequestException(`데이터베이스 오류: ${error.message}`);
    }
    throw new InternalServerErrorException(`퀴즈셋 생성 실패: ${error.message}`);
  }
}
