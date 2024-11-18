import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { CreateChoiceDto, CreateQuizDto, CreateQuizSetDto } from './dto/create-quiz.dto';
import { UpdateQuizSetDto } from './dto/update-quiz.dto';
import { QuizModel } from './entities/quiz.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, QueryFailedError, Repository } from 'typeorm';
import { QuizSetModel } from './entities/quiz-set.entity';
import { QuizChoiceModel } from './entities/quiz-choice.entity';
import { groupBy } from 'lodash';
import { UserModel } from '../user/entities/user.entity';
import { ChoiceDto, QuizDto, QuizSetDto, QuizSetList } from './dto/quiz-set-list-response.dto';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizModel)
    private readonly quizRepository: Repository<QuizModel>,
    @InjectRepository(QuizSetModel)
    private readonly quizSetRepository: Repository<QuizSetModel>,
    @InjectRepository(QuizChoiceModel)
    private readonly quizChoiceRepository: Repository<QuizChoiceModel>,
    private dataSource: DataSource
  ) {}

  /**
   * 퀴즈셋, 퀴즈, 선택지를 생성합니다.
   * @param createQuizSetDto 생성할 퀴즈셋 데이터
   * @returns 생성된 퀴즈셋
   */
  async createQuizSet(dto: CreateQuizSetDto) {
    this.validateQuizSet(dto);
    return this.dataSource.transaction(async (manager) => {
      const user = await this.extractUser(manager);
      const quizSet = await this.createQuizSetEntity(manager, dto, user);
      await this.createQuizzesWithChoices(manager, dto.quizList, quizSet);

      return {
        id: quizSet.id
      };
    }).catch(this.handleError);
  }

  private async extractUser(manager: EntityManager): Promise<UserModel> {
    // TODO: 실제 인증된 사용자 정보 사용
    const email = 'honux@codesquad.co.kr';

    const user = await manager.findOne(UserModel, {
      where: { email }
    });

    if (user) return user;

    // TODO: 실제 인증된 사용자 정보 사용
    const newUser = manager.create(UserModel, {
      email,
      password: '123456',
      nickname: 'honux',
      point: 100,
      status: 'ACTIVE'
    });

    return manager.save(newUser);
  }

  private async createQuizSetEntity(
    manager: EntityManager,
    dto: CreateQuizSetDto,
    user: UserModel
  ): Promise<QuizSetModel> {
    const quizSet = manager.create(QuizSetModel, {
      title: dto.title,
      category: dto.category,
      user,
      userId: user.id
    });

    return manager.save(quizSet);
  }

  private async createQuizzesWithChoices(
    manager: EntityManager,
    quizList: CreateQuizDto[],
    quizSet: QuizSetModel
  ): Promise<void> {
    await Promise.all(quizList.map(async (quizData) => {
      const quiz = await this.createQuiz(manager, quizData, quizSet);
      await this.createChoices(manager, quizData.choiceList, quiz);
    }));
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
    const choices = choiceList.map(choice =>
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
    const hasAnswer = quiz.choiceList.some(choice => choice.isAnswer);
    if (!hasAnswer) {
      throw new BadRequestException(`퀴즈 "${quiz.quiz}"에 정답이 없습니다.`);
    }
  }

  private validateChoiceOrders(quiz: CreateQuizDto): void {
    const orders = new Set(quiz.choiceList.map(choice => choice.choiceOrder));
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
    const quizSets = await this.fetchQuizSets(category, offset, limit);

    if (!quizSets.length) {
      return new QuizSetList([]);
    }

    const quizzes = await this.fetchQuizzesByQuizSets(quizSets);
    const choices = await this.fetchChoicesByQuizzes(quizzes);

    const mappedData = this.mapRelations(quizSets, quizzes, choices);

    return new QuizSetList(mappedData);
  }

  private async fetchQuizSets(
    category: string,
    offset: number,
    limit: number
  ): Promise<QuizSetModel[]> {
    return this.quizSetRepository.find({
      where: {
        category,
        deletedAt: IsNull()
      },
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
    quizzes: QuizModel[],
    choices: QuizChoiceModel[]
  ): QuizSetDto[] {
    const choicesByQuizId = groupBy(choices, 'quizId');
    const quizzesByQuizSetId = groupBy(quizzes, 'quizSetId');

    return quizSets.map(quizSet => ({
      id: quizSet.id.toString(),
      title: quizSet.title,
      category: quizSet.category,
      quizList: this.mapQuizzes(quizzesByQuizSetId[quizSet.id] || [], choicesByQuizId)
    }));
  }

  private mapQuizzes(
    quizzes: QuizModel[],
    choicesByQuizId: Record<string, QuizChoiceModel[]>
  ): QuizDto[] {
    return quizzes.map(quiz => ({
      id: quiz.id.toString(),
      quiz: quiz.quiz,
      limitTime: quiz.limitTime,
      choiceList: this.mapChoices(choicesByQuizId[quiz.id] || [])
    }));
  }

  private mapChoices(choices: QuizChoiceModel[]): ChoiceDto[] {
    return choices.map(choice => ({
      content: choice.choiceContent,
      order: choice.choiceOrder
    }));
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

  //todo : 토큰으로 로그인한 사용자 정보 가져오기 && 권한 확인
  // if (quizSet.userId !== userId) {
  //   throw new ForbiddenException('해당 퀴즈셋을 삭제할 권한이 없습니다.');
  // }
  async remove(id: number) {
    return this.dataSource.transaction(async (manager) => {
      const quizSet = await this.findActiveQuizSet(manager, id);
      await this.softDeleteQuizSet(manager, quizSet);
      return this.generateRemoveResponse();
    });
  }

  private async findActiveQuizSet(manager: EntityManager, id: number): Promise<QuizSetModel> {
    const quizSet = await manager.findOne(QuizSetModel, {
      where: {
        id,
        deletedAt: IsNull()
      },
      relations: ['user']
    });

    if (!quizSet) {
      throw new NotFoundException(`ID ${id}인 퀴즈셋을 찾을 수 없습니다.`);
    }

    return quizSet;
  }

  private async softDeleteQuizSet(manager: EntityManager, quizSet: QuizSetModel): Promise<void> {
    await manager.softRemove(quizSet);
  }

  private generateRemoveResponse() {
    return {
      success: true,
      message: '퀴즈셋이 성공적으로 삭제되었습니다.'
    };
  }

  async update(id: number, updateDto: UpdateQuizSetDto) {
    // 트랜잭션 시작
    return this.dataSource.transaction(async (manager) => {
      // 퀴즈셋 조회
      const quizSet = await manager.findOne(QuizSetModel, {
        where: { id },
        relations: {
          user: true,
          quizList: {
            choiceList: true
          }
        }
      });

      if (!quizSet) {
        throw new NotFoundException(`ID ${id}인 퀴즈셋을 찾을 수 없습니다.`);
      }

      // 1. 기본 필드 업데이트 (변경감지 사용)
      if (updateDto.title) {
        quizSet.title = updateDto.title;
      }
      if (updateDto.category) {
        quizSet.category = updateDto.category;
      }

      // 2. 퀴즈 업데이트
      if (updateDto.quizList) {
        await Promise.all(
          updateDto.quizList.map(async (quizDto, index) => {
            const quiz = quizSet.quizList[index] || new QuizModel();

            // 2.1 퀴즈 필드 업데이트 (변경감지 사용)
            if (quizDto.quiz) {
              quiz.quiz = quizDto.quiz;
            }
            if (quizDto.limitTime) {
              quiz.limitTime = quizDto.limitTime;
            }

            // 2.2 선택지 업데이트
            if (quizDto.choiceList) {
              quiz.choiceList = await Promise.all(
                quizDto.choiceList.map(async (choiceDto, choiceIndex) => {
                  const choice = quiz.choiceList?.[choiceIndex] || new QuizChoiceModel();

                  // 선택지 필드 업데이트 (변경감지 사용)
                  if (choiceDto.choiceContent) {
                    choice.choiceContent = choiceDto.choiceContent;
                  }
                  if (choiceDto.choiceOrder) {
                    choice.choiceOrder = choiceDto.choiceOrder;
                  }
                  if (choiceDto.isAnswer !== undefined) {
                    choice.isAnswer = choiceDto.isAnswer;
                  }

                  await manager.save(choice);
                  return choice;
                })
              );
            }

            if (!quiz.id) {
              quiz.quizSet = quizSet;
            }

            await manager.save(quiz);
          })
        );
      }

      // 3. 변경사항 저장
      await manager.save(quizSet);

      const ret = {
        id: quizSet.id
      };

      return ret;
    });
  }
}
