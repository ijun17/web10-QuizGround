import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { QuizModel } from '../entities/quiz.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { QuizSetModel } from '../entities/quiz-set.entity';
import { QuizChoiceModel } from '../entities/quiz-choice.entity';
import { groupBy } from 'lodash';
import { ChoiceDto, QuizDto, QuizSetDto, QuizSetList } from '../dto/quiz-set-list-response.dto';

@Injectable()
export class QuizSetReadService {
  constructor(
    @InjectRepository(QuizModel)
    private readonly quizRepository: Repository<QuizModel>,
    @InjectRepository(QuizSetModel)
    private readonly quizSetRepository: Repository<QuizSetModel>,
    @InjectRepository(QuizChoiceModel)
    private readonly quizChoiceRepository: Repository<QuizChoiceModel>,
  ) {}

  /**
   * 퀴즈셋 목록을 조회합니다.
   * @param category 카테고리
   * @param offset 오프셋
   * @param limit 한 페이지당 개수
   * @returns 퀴즈셋 목록
   */
  async findAllWithQuizzesAndChoices(
    category: string,
    offset: number,
    limit: number,
    search: string
  ): Promise<QuizSetList<QuizSetDto[]>> {
    let quizSets = await this.fetchQuizSets(category, offset, limit);

    if (!quizSets.length) {
      return new QuizSetList([]);
    }

    const quizzes = await this.fetchQuizzesByQuizSets(quizSets);
    const choices = await this.fetchChoicesByQuizzes(quizzes);

    quizSets = this.filterBySearch(search, quizSets, quizzes, choices);

    return new QuizSetList(this.mapRelations(quizSets, quizzes));
  }

  private async fetchQuizSets(
    category: string | undefined,
    offset: number,
    limit: number
  ): Promise<QuizSetModel[]> {
    const whereCondition: any = {
      deletedAt: IsNull()
    };

    if (category) {
      whereCondition.category = category;
    }

    return this.quizSetRepository.find({
      where: whereCondition,
      skip: offset,
      take: limit,
      order: {
        createdAt: 'DESC'
      }
    });
  }

  private async fetchQuizzesByQuizSets(quizSets: QuizSetModel[]): Promise<QuizModel[]> {
    const quizSetIds = quizSets.map(qs => qs.id);
    return this.quizRepository
      .createQueryBuilder('quiz')
      .where('quiz.quizSetId IN (:...quizSetIds)', { quizSetIds })
      .andWhere('quiz.deletedAt IS NULL')
      .getMany();
  }

  private async fetchChoicesByQuizzes(quizzes: QuizModel[]): Promise<QuizChoiceModel[]> {
    const quizIds = quizzes.map(q => q.id);
    return this.quizChoiceRepository
      .createQueryBuilder('choice')
      .where('choice.quizId IN (:...quizIds)', { quizIds })
      .andWhere('choice.deletedAt IS NULL')
      .getMany();
  }

  private mapRelations(
    quizSets: QuizSetModel[],
    quizzes: QuizModel[]
  ): QuizSetDto[] {
    const quizzesByQuizSetId = groupBy(quizzes, 'quizSetId');

    return quizSets.map(quizSet => ({
      id: quizSet.id.toString(),
      title: quizSet.title,
      category: quizSet.category,
      quizCount: quizzesByQuizSetId[quizSet.id].length,
    }));
  }

  private filterBySearch(search: string, quizSets: QuizSetModel[], quizzes: QuizModel[], choices: QuizChoiceModel[]) {
    if (search) {
      return quizSets.filter(quizSet => {
        const quizList = quizzes.filter(quiz => quiz.quizSetId === quizSet.id);
        const choiceList = choices.filter(choice => quizList.some(quiz => quiz.id === choice.quizId));
        return quizSet.title.includes(search) ||
          quizList.some(quiz => quiz.quiz.includes(search)) ||
          choiceList.some(choice => choice.choiceContent.includes(search));
      });
    }

    return quizSets;
  }

  /**
   * 현재 api 명세에 따라 user 정보는 안주는것으로 구현되어있음.
   * 이에따라 test code에서도 user 정보를 test 하지 않음.
   * 향후 필요시 구현가능(relation 옵션 활용)
   * @param id
   */
  async findOne(id: number) {
    const quizSet = await this.findQuizSetById(id);
    const quizzes = await this.findQuizzesByQuizSetId(id);
    const choices = await this.findChoicesByQuizIds(quizzes.map(q => q.id));
    return this.mapToQuizSetDetailDto(quizSet, quizzes, choices);
  }

  private async findQuizSetById(id: number): Promise<QuizSetModel> {
    const quizSet = await this.quizSetRepository.findOne({
      where: { id, deletedAt: IsNull() }
    });

    if (!quizSet) {
      throw new NotFoundException(`QuizSet with id ${id} not found`);
    }

    return quizSet;
  }

  private async findQuizzesByQuizSetId(quizSetId: number): Promise<QuizModel[]> {
    return this.quizRepository
      .createQueryBuilder('quiz')
      .where('quiz.quizSetId = :quizSetId', { quizSetId })
      .andWhere('quiz.deletedAt IS NULL')
      .getMany();
  }

  private async findChoicesByQuizIds(quizIds: number[]): Promise<QuizChoiceModel[]> {
    if (quizIds.length === 0) return [];

    return this.quizChoiceRepository
      .createQueryBuilder('choice')
      .where('choice.quizId IN (:...quizIds)', { quizIds })
      .andWhere('choice.deletedAt IS NULL')
      .getMany();
  }

  private mapToQuizSetDetailDto(
    quizSet: QuizSetModel,
    quizzes: QuizModel[],
    choices: QuizChoiceModel[]
  ) {
    const choicesByQuizId = groupBy(choices, 'quizId');

    return {
      id: quizSet.id.toString(),
      title: quizSet.title,
      category: quizSet.category,
      quizList: quizzes.map(quiz => ({
        id: quiz.id.toString(),
        quiz: quiz.quiz,
        limitTime: quiz.limitTime,
        choiceList: (choicesByQuizId[quiz.id] || []).map(choice => ({
          content: choice.choiceContent,
          order: choice.choiceOrder,
          isAnswer: choice.isAnswer
        }))
      }))
    };
  }
}