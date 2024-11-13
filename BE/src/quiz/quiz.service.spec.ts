import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, QueryRunner } from 'typeorm';
import { QuizService } from './quiz.service';
import { QuizSetModel } from './entities/quiz-set.entity';
import { QuizModel } from './entities/quiz.entity';
import { QuizChoiceModel } from './entities/quiz-choice.entity';
import { UserModel } from '../user/entities/user.entity';
import { CreateQuizSetDto } from './dto/create-quiz.dto';
import { BadRequestException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UserQuizArchiveModel } from '../user/entities/user-quiz-archive.entity';

describe('QuizService', () => {
  let quizService: QuizService;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '../.env',
          isGlobal: true
        }),
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST || 'localhost',
          port: +process.env.DB_PORT || 3306,
          username: process.env.DB_USER,
          password: process.env.DB_PASSWD,
          database: process.env.DB_NAME,
          entities: [QuizSetModel, QuizModel, QuizChoiceModel, UserModel, UserQuizArchiveModel],
          synchronize: process.env.DEV ? true : false, // 개발 모드에서만 활성화
          logging: true, // 모든 쿼리 로깅
          logger: 'advanced-console'
          // extra: {
          //   // 글로벌 batch size 설정
          //   maxBatchSize: 100
          // }
        }),
        TypeOrmModule.forFeature([QuizSetModel, QuizModel, QuizChoiceModel, UserModel])
      ],
      providers: [QuizService]
    }).compile();

    quizService = module.get<QuizService>(QuizService);
    dataSource = module.get<DataSource>(DataSource);
  });

  beforeEach(async () => {
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  describe('createQuizSet', () => {
    it('퀴즈셋을 성공적으로 생성해야 한다', async () => {
      // Given
      const createQuizSetDto: CreateQuizSetDto = {
        title: '자바스크립트 기초',
        category: 'PROGRAMMING',
        quizList: [
          {
            quiz: 'JavaScript의 원시 타입이 아닌 것은?',
            limitTime: 30,
            choiceList: [
              {
                choiceContent: 'String',
                choiceOrder: 1,
                isAnswer: false
              },
              {
                choiceContent: 'Array',
                choiceOrder: 2,
                isAnswer: true
              },
              {
                choiceContent: 'Number',
                choiceOrder: 3,
                isAnswer: false
              }
            ]
          }
        ]
      };

      // When
      const result = await quizService.createQuizSet(createQuizSetDto);

      // Then
      expect(result).toBeDefined();
      expect(result.data.id).toBeDefined();

      // 데이터가 정상적으로 저장되었는지 확인
      const savedQuizSet = await queryRunner.manager.findOne(QuizSetModel, {
        where: { id: result.data.id },
        relations: ['quizList', 'quizList.choiceList', 'user']
      });

      expect(savedQuizSet).toBeDefined();
      expect(savedQuizSet.title).toBe(createQuizSetDto.title);
      // expect(savedQuizSet.user.email).toBe('honux@codesquad.co.kr');
      expect(savedQuizSet.quizList).toHaveLength(1);
      expect(savedQuizSet.quizList[0].choiceList).toHaveLength(3);
    });

    it('정답이 없는 퀴즈셋 생성 시 에러가 발생해야 한다', async () => {
      // Given
      const invalidQuizSetDto: CreateQuizSetDto = {
        title: '잘못된 퀴즈셋',
        category: 'PROGRAMMING',
        quizList: [
          {
            quiz: '문제',
            limitTime: 30,
            choiceList: [
              {
                choiceContent: '보기1',
                choiceOrder: 1,
                isAnswer: false
              },
              {
                choiceContent: '보기2',
                choiceOrder: 2,
                isAnswer: false
              }
            ]
          }
        ]
      };

      // When & Then
      await expect(quizService.createQuizSet(invalidQuizSetDto)).rejects.toThrow(
        BadRequestException
      );
    });

    it('선택지 번호가 중복된 퀴즈셋 생성 시 에러가 발생해야 한다', async () => {
      // Given
      const duplicateOrderQuizSetDto: CreateQuizSetDto = {
        title: '중복 번호 퀴즈셋',
        category: 'PROGRAMMING',
        quizList: [
          {
            quiz: '문제',
            limitTime: 30,
            choiceList: [
              {
                choiceContent: '보기1',
                choiceOrder: 1,
                isAnswer: true
              },
              {
                choiceContent: '보기2',
                choiceOrder: 1,
                isAnswer: false
              }
            ]
          }
        ]
      };

      // When & Then
      await expect(quizService.createQuizSet(duplicateOrderQuizSetDto)).rejects.toThrow(
        BadRequestException
      );
    });
  });
});
