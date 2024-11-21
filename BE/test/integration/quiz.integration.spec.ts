import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource, EntityManager, QueryRunner } from 'typeorm';
import { BadRequestException } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { QuizSetService } from '../../src/quiz-set/service/quiz-set.service';
import { QuizSetModel } from '../../src/quiz-set/entities/quiz-set.entity';
import { QuizModel } from '../../src/quiz-set/entities/quiz.entity';
import { QuizChoiceModel } from '../../src/quiz-set/entities/quiz-choice.entity';
import { UserModel } from '../../src/user/entities/user.entity';
import { UserQuizArchiveModel } from '../../src/user/entities/user-quiz-archive.entity';
import { CreateQuizSetDto } from '../../src/quiz-set/dto/create-quiz.dto';
import { QuizSetCreateService } from '../../src/quiz-set/service/quiz-set-create.service';
import { QuizSetReadService } from '../../src/quiz-set/service/quiz-set-read.service';
import { QuizSetUpdateService } from '../../src/quiz-set/service/quiz-set-update.service';
import { QuizSetDeleteService } from '../../src/quiz-set/service/quiz-set-delete.service';
import { UserService } from '../../src/user/user.service';
import { JwtModule } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

describe('QuizService', () => {
  let quizService: QuizSetService;
  let dataSource: DataSource;
  let queryRunner: QueryRunner;
  let userService: UserService;
  let testUser: UserModel;
  let testOtherUser: UserModel;

  beforeAll(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({
          envFilePath: '../.env',
          isGlobal: true
        }),
        TypeOrmModule.forRoot({
          type: 'mysql',
          host: process.env.DB_HOST_TEST || process.env.DB_HOST || '127.0.0.1',
          port: +process.env.DB_PORT_TEST || +process.env.DB_PORT || 3306,
          username: process.env.DB_USER_TEST || process.env.DB_USER || 'root',
          password: process.env.DB_PASSWD_TEST || process.env.DB_PASSWD || 'test',
          database: process.env.DB_NAME_TEST || process.env.DB_NAME || 'test_db',
          entities: [QuizSetModel, QuizModel, QuizChoiceModel, UserModel, UserQuizArchiveModel],
          synchronize: true // test모드에서는 항상 활성화
          // logging: true, // 모든 쿼리 로깅
          // logger: 'advanced-console'
          // extra: {
          //   // 글로벌 batch size 설정
          //   maxBatchSize: 100
          // }
        }),
        TypeOrmModule.forFeature([QuizSetModel, QuizModel, QuizChoiceModel, UserModel]),
        JwtModule
      ],
      providers: [
        QuizSetService,
        QuizSetCreateService,
        QuizSetReadService,
        QuizSetUpdateService,
        QuizSetDeleteService,
        UserService
      ]
    }).compile();

    quizService = module.get<QuizSetService>(QuizSetService);
    dataSource = module.get<DataSource>(DataSource);
    userService = module.get<UserService>(UserService);
  });

  beforeEach(async () => {
    queryRunner = dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    testUser = await createUser(
      queryRunner.manager,
      'integration_test@test.com',
      'test_password',
      'Test'
    );
    testOtherUser = await createUser(
      queryRunner.manager,
      'integration_other@test.comm',
      'test_password',
      'Test2'
    );
  });

  afterEach(async () => {
    await queryRunner.rollbackTransaction();
    await queryRunner.release();
  });

  afterAll(async () => {
    await dataSource.destroy();
  });

  it('should be defined', () => {
    expect(quizService).toBeDefined();
    expect(dataSource).toBeDefined();
    expect(userService).toBeDefined();
  });

  describe('퀴즈셋 생성 테스트', () => {
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

      const result = await quizService.createQuizSet(createQuizSetDto, testUser);
      const savedQuizSet = await queryRunner.manager.findOne(QuizSetModel, {
        where: { id: result.id },
        relations: ['quizList', 'quizList.choiceList', 'user']
      });

      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
      expect(savedQuizSet).toBeDefined();
      expect(savedQuizSet.title).toBe(createQuizSetDto.title);
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
      await expect(quizService.createQuizSet(invalidQuizSetDto, testUser)).rejects.toThrow(
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
      await expect(quizService.createQuizSet(duplicateOrderQuizSetDto, testUser)).rejects.toThrow(
        BadRequestException
      );
    });
  });

  describe('퀴즈셋 목록 조회 테스트', () => {
    it('카테고리별 퀴즈셋 목록을 가져와야한다', async () => {
      // Given - 테스트 데이터 생성
      const createQuizSetDto: CreateQuizSetDto = {
        title: '자바스크립트 기초',
        category: 'PROGRAMMING',
        quizList: [
          {
            quiz: '테스트 문제',
            limitTime: 30,
            choiceList: [
              {
                choiceContent: '보기1',
                choiceOrder: 1,
                isAnswer: true
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

      await quizService.createQuizSet(createQuizSetDto, testUser);

      // When
      const result = await quizService.findAllWithQuizzesAndChoices('PROGRAMMING', 0, 10, '');

      // Then
      expect(result.quizSetList).toBeDefined();
      expect(result.quizSetList[0].category).toBe('PROGRAMMING');
      expect(result.quizSetList[0].quizCount).toBe(1);
    });

    it('존재하지 않는 카테고리는 빈 배열을 반환해야 한다', async () => {
      // When
      const result = await quizService.findAllWithQuizzesAndChoices('INVALID', 0, 10, '');

      // Then
      expect(result.quizSetList).toHaveLength(0);
    });

    it('퀴즈셋 목록 조회 응답에 적절한 커서 응답을 한다', async () => {
      for (let i = 0; i < 20; i++) {
        await createQuizSetTestData(quizService, `테스트${i}`);
      }

      const result = await quizService.findAllWithQuizzesAndChoices('', 0, 10, '');

      expect(result.quizSetList).toHaveLength(10);
      expect(result.paging.nextCursor).toBe(result.quizSetList[9].id);
      expect(result.paging.hasNextPage).toBe(true);
    })

    it('검색어로 퀴즈셋 목록을 가져와야 한다', async () => {
      for (let i = 0; i < 20; i++) {
        await createQuizSetTestData(quizService, `테스트${i}`, testUser);
      }

      const result = await quizService.findAllWithQuizzesAndChoices('', 0, 10, '테스트19');
      result.quizSetList.forEach(quizSet => {
        expect(quizSet.title).toContain('테스트19');
      });
    })

    it('검색어가 유효하지 않아 퀴즈셋 목록이 없다', async () => {
      for (let i = 0; i < 20; i++) {
        await createQuizSetTestData(quizService, `테스트${i}`, testUser);
      }

      const result = await quizService.findAllWithQuizzesAndChoices('', 0, 10, '테스트20');

      expect(result.quizSetList).toHaveLength(0);
    });
  });

  describe('퀴즈셋 단일 조회 테스트', () => {
    let testQuizSet;

    beforeEach(async () => {
      // Given - 테스트 데이터 생성
      const dto = {
        title: '테스트 퀴즈',
        category: 'TEST',
        quizList: [
          {
            quiz: '문제1',
            limitTime: 30,
            choiceList: [
              {
                choiceContent: '보기1',
                choiceOrder: 1,
                isAnswer: true
              }
            ]
          }
        ]
      };

      const result = await quizService.createQuizSet(dto, testUser);
      testQuizSet = result;
    });

    it('ID로 퀴즈셋을 찾을 수 있어야 한다.', async () => {
      // When
      const result = await quizService.findOne(testQuizSet.id);

      // Then
      expect(result).toBeDefined();
      expect(result.id).toBe(testQuizSet.id.toString());
      expect(result.quizList).toHaveLength(1);
      expect(result.quizList[0].choiceList).toHaveLength(1);
    });

    it('존재하지 않는 ID로 조회시 에러가 발생해야 한다.', async () => {
      // When & Then
      await expect(quizService.findOne(999999)).rejects.toThrow();
    });
  });

  describe('퀴즈셋 수정 테스트', () => {
    let originQuizSetId;

    beforeEach(async () => {
      // Given - 테스트용 퀴즈셋 생성
      const dto = {
        title: '원본 퀴즈',
        category: 'TEST',
        quizList: [
          {
            quiz: '원본 문제',
            limitTime: 30,
            choiceList: [
              {
                choiceContent: '원본 보기',
                choiceOrder: 1,
                isAnswer: true
              }
            ]
          }
        ]
      };

      const result = await quizService.createQuizSet(dto, testUser);
      originQuizSetId = result.id;
    });

    it('퀴즈셋을 수정할 수 있어야 한다.', async () => {
      // Given
      const updateDto = {
        title: '수정된 퀴즈',
        category: 'UPDATED',
        quizList: [
          {
            quiz: '수정된 문제',
            limitTime: 60,
            choiceList: [
              {
                choiceContent: '수정된 보기',
                choiceOrder: 1,
                isAnswer: true
              }
            ]
          }
        ]
      };

      // When
      await quizService.update(originQuizSetId, updateDto, testUser);

      // Then
      const updated = await quizService.findOne(originQuizSetId);
      expect(updated.id).toBe(originQuizSetId.toString());
      expect(updated.title).toBe('수정된 퀴즈');
      expect(updated.category).toBe('UPDATED');
      expect(updated.quizList[0].quiz).toBe('수정된 문제');
      expect(updated.quizList[0].limitTime).toBe(60);
    });

    it('존재하지 않는 퀴즈셋 수정시 에러가 발생해야 한다.', async () => {
      // When & Then
      await expect(quizService.update(999999, { title: 'test' }, testUser)).rejects.toThrow();
    });

    it('생성한 사람과 다른 사람이 수정할 시 에러가 발생해야 한다.', async () => {
      await expect(
        quizService.update(originQuizSetId, { title: '수정' }, testOtherUser)
      ).rejects.toThrow();
    });
  });

  describe('퀴즈셋 삭제 테스트', () => {
    let testQuizSet;

    beforeEach(async () => {
      // Given - 테스트용 퀴즈셋 생성
      const dto = {
        title: '삭제될 퀴즈',
        category: 'TEST',
        quizList: [
          {
            quiz: '문제',
            limitTime: 30,
            choiceList: [
              {
                choiceContent: '보기',
                choiceOrder: 1,
                isAnswer: true
              }
            ]
          }
        ]
      };

      const result = await quizService.createQuizSet(dto, testUser);
      testQuizSet = result;
    });

    it('퀴즈셋을 soft delete 할 수 있어야 한다.', async () => {
      // When
      const result = await quizService.remove(testQuizSet.id, testUser);

      // Then
      expect(result.success).toBe(true);

      // soft delete 되었는지 확인 (일반 조회시 조회 안됨)
      await expect(quizService.findOne(testQuizSet.id)).rejects.toThrow();
    });

    it('존재하지 않는 퀴즈셋 삭제시 에러가 발생해야 한다.', async () => {
      // When & Then
      await expect(quizService.remove(999999, testUser)).rejects.toThrow();
    });

    it('생성한 사람과 다른 사람이 삭제할 시 에러가 발생해야 한다.', async () => {
      await expect(quizService.remove(testQuizSet.id, testOtherUser)).rejects.toThrow();
    });
  });
});

async function createQuizSetTestData(
  quizService: QuizSetService,
  quizSetTitle: string = '테스트',
  user: UserModel
) {
  const createQuizSetDto: CreateQuizSetDto = {
    title: quizSetTitle,
    category: 'PROGRAMMING',
    quizList: [
      {
        quiz: '테스트',
        limitTime: 30,
        choiceList: [
          {
            choiceContent: '보기1',
            choiceOrder: 1,
            isAnswer: true
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

  await quizService.createQuizSet(createQuizSetDto, user);
}

async function createUser(
  manager: EntityManager,
  email: string,
  password: string,
  nickname: string
) {
  const salt = await bcrypt.genSalt();
  const hashedPassword = await bcrypt.hash(password, salt);
  const newUser = manager.create(UserModel, {
    email: email,
    password: hashedPassword,
    nickname: nickname,
    status: '?'
  });
  await manager.save(newUser);

  return newUser;
}
