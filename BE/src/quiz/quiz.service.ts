import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException
} from '@nestjs/common';
import { CreateQuizDto, CreateQuizSetDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizModel } from './entities/quiz.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, QueryFailedError, Repository } from 'typeorm';
import { QuizSetModel } from './entities/quiz-set.entity';
import { QuizChoiceModel } from './entities/quiz-choice.entity';
import { Result } from './dto/Response.dto';
import { groupBy } from 'lodash';
import { UserModel } from '../user/entities/user.entity';

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

  create(createQuizDto: CreateQuizDto) {
    return 'This action adds a new quiz';
  }

  async findAllWithQuizzesAndChoices(category: string, offset: number, limit: number) {
    // 1. QuizSet 페이징 조회
    const quizSets = await this.quizSetRepository.find({
      where: { category },
      skip: offset,
      take: limit,
      order: {
        createdAt: 'DESC'
      }
    });

    if (quizSets.length === 0) {
      return new Result([]);
    }

    // 2. Quiz 한 번에 조회
    const quizSetIds = quizSets.map((qs) => qs.id);
    const quizzes = await this.quizRepository
      .createQueryBuilder('quiz')
      .where('quiz.quizSetId IN (:...quizSetIds)', { quizSetIds })
      .getMany();

    // 3. Choice 한 번에 조회
    const quizIds = quizzes.map((q) => q.id);
    const choices = await this.quizChoiceRepository
      .createQueryBuilder('choice')
      .where('choice.quizId IN (:...quizIds)', { quizIds })
      .getMany();

    // 4. 메모리에서 관계 매핑
    const choicesByQuizId = groupBy(choices, 'quizId');
    const quizzesByQuizSetId = groupBy(quizzes, 'quizSetId');

    const dtos = quizSets.map((quizSet) => ({
      id: quizSet.id.toString(),
      title: quizSet.title,
      category: quizSet.category,
      quizList: (quizzesByQuizSetId[quizSet.id] || []).map((quiz) => ({
        id: quiz.id.toString(),
        quiz: quiz.quiz,
        limitTime: quiz.limitTime,
        choiceList: (choicesByQuizId[quiz.id] || []).map((choice) => ({
          content: choice.choiceContent,
          order: choice.choiceOrder
        }))
      }))
    }));

    return new Result(dtos);
  }

  /**
   * 현재 api 명세에 따라 user 정보는 안주는것으로 구현되어있음.
   * 이에따라 test code에서도 user 정보를 test 하지 않음.
   * 향후 필요시 구현가능(relation 옵션 활용)
   * @param id
   */
  async findOne(id: number) {
    // 1. QuizSet 조회
    const quizSet = await this.quizSetRepository.findOne({
      where: { id }
    });

    if (!quizSet) {
      throw new NotFoundException(`QuizSet with id ${id} not found`);
    }

    // 2. Quiz 조회
    const quizzes = await this.quizRepository
      .createQueryBuilder('quiz')
      .where('quiz.quizSetId = :quizSetId', { quizSetId: id })
      .getMany();

    // 3. Choice 조회
    const quizIds = quizzes.map((q) => q.id);
    const choices = await this.quizChoiceRepository
      .createQueryBuilder('choice')
      .where('choice.quizId IN (:...quizIds)', { quizIds })
      .getMany();

    // 4. 메모리에서 관계 매핑
    const choicesByQuizId = groupBy(choices, 'quizId');

    // 5. DTO 변환
    const dto = {
      id: quizSet.id.toString(),
      title: quizSet.title,
      category: quizSet.category,
      quizList: quizzes.map((quiz) => ({
        id: quiz.id.toString(),
        quiz: quiz.quiz,
        limitTime: quiz.limitTime,
        choiceList: (choicesByQuizId[quiz.id] || []).map((choice) => ({
          content: choice.choiceContent,
          order: choice.choiceOrder
        }))
      }))
    };

    return dto;
  }

  update(id: number, updateQuizDto: UpdateQuizDto) {
    return `This action updates a #${id} quiz`;
  }

  remove(id: number) {
    return `This action removes a #${id} quiz`;
  }

  /**
   * 퀴즈셋, 퀴즈, 선택지를 생성합니다.
   * @param createQuizSetDto 생성할 퀴즈셋 데이터
   * @returns 생성된 퀴즈셋
   */
  async createQuizSet(createQuizSetDto: CreateQuizSetDto) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      this.validateQuizSet(createQuizSetDto);

      // 1. 유저 존재 확인
      // TODO : 토큰으로 로그인한 사용자 정보 가져오기
      // 1. 유저 찾기 또는 생성
      let user = await queryRunner.manager.findOne(UserModel, {
        where: { email: 'honux@codesquad.co.kr' }
      });

      // 유저가 없다면 생성
      if (!user) {
        user = queryRunner.manager.create(UserModel, {
          email: 'honux@codesquad.co.kr',
          password: '123456',
          nickname: 'honux',
          point: 100,
          status: 'ACTIVE'
        });
        await queryRunner.manager.save(user);
      }

      // 2. 퀴즈셋 생성
      const quizSet = queryRunner.manager.create(QuizSetModel, {
        title: createQuizSetDto.title,
        category: createQuizSetDto.category,
        user,
        userId: user.id
      });
      await queryRunner.manager.save(quizSet);

      // 2. 퀴즈 생성
      for (const quizData of createQuizSetDto.quizList) {
        // 2.1 퀴즈 엔티티 생성 및 저장
        const quiz = queryRunner.manager.create(QuizModel, {
          quizSet,
          quiz: quizData.quiz,
          limitTime: quizData.limitTime
        });
        await queryRunner.manager.save(quiz);

        // 2.2 선택지 생성
        const choices = quizData.choiceList.map((choiceData) =>
          queryRunner.manager.create(QuizChoiceModel, {
            quiz,
            choiceContent: choiceData.choiceContent,
            choiceOrder: choiceData.choiceOrder,
            isAnswer: choiceData.isAnswer
          })
        );
        await queryRunner.manager.save(choices);
      }

      // 3. 생성된 퀴즈셋 조회 (관계 데이터 포함)
      const savedQuizSet = await queryRunner.manager.findOne(QuizSetModel, {
        where: { id: quizSet.id }
      });

      await queryRunner.commitTransaction();

      const ret = {
        data: {
          id: savedQuizSet.id
        }
      };

      return ret;
    } catch (error) {
      await queryRunner.rollbackTransaction();

      // BadRequestException은 그대로 전파
      if (error instanceof BadRequestException) {
        throw error;
      }

      // DB 관련 에러 처리
      if (error instanceof QueryFailedError) {
        throw new BadRequestException(`데이터베이스 오류: ${error.message}`);
      }

      // 그 외 에러는 InternalServerError로 변환
      throw new InternalServerErrorException(`퀴즈셋 생성 실패: ${error.message}`);
    } finally {
      await queryRunner.release();
    }
  }

  private validateQuizSet(quizSet: CreateQuizSetDto): void {
    for (const quiz of quizSet.quizList) {
      // 정답이 하나 이상 존재하는지 확인
      const answerCount = quiz.choiceList.filter((choice) => choice.isAnswer).length;
      if (answerCount === 0) {
        throw new BadRequestException(`퀴즈 "${quiz.quiz}"에 정답이 없습니다.`);
      }

      // 선택지 번호가 중복되지 않는지 확인
      const orders = new Set(quiz.choiceList.map((choice) => choice.choiceOrder));
      if (orders.size !== quiz.choiceList.length) {
        throw new BadRequestException(`퀴즈 "${quiz.quiz}"의 선택지 번호가 중복됩니다.`);
      }
    }
  }
}
