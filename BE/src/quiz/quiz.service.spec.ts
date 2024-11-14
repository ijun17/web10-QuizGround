import { Test, TestingModule } from '@nestjs/testing';
import { DataSource, Repository } from 'typeorm';
import { getRepositoryToken } from '@nestjs/typeorm';
import { QuizService } from './quiz.service';
import { QuizModel } from './entities/quiz.entity';
import { QuizSetModel } from './entities/quiz-set.entity';
import { QuizChoiceModel } from './entities/quiz-choice.entity';

describe('QuizService', () => {
  let service: QuizService;
  let quizRepository: Repository<QuizModel>;
  let quizSetRepository: Repository<QuizSetModel>;
  let quizChoiceRepository: Repository<QuizChoiceModel>;
  let dataSource: DataSource;

  const mockRepository = {
    createQuizSet: jest.fn(),
    findAllWithQuizzesAndChoices: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn()
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: getRepositoryToken(QuizModel),
          useValue: mockRepository
        },
        {
          provide: getRepositoryToken(QuizSetModel),
          useValue: mockRepository
        },
        {
          provide: getRepositoryToken(QuizChoiceModel),
          useValue: mockRepository
        },
        {
          provide: DataSource, // DataSource provider
          useValue: {
            createQueryRunner: jest.fn(() => ({
              connect: jest.fn(),
              startTransaction: jest.fn(),
              commitTransaction: jest.fn(),
              rollbackTransaction: jest.fn(),
              release: jest.fn(),
              manager: {
                findOne: jest.fn(),
                save: jest.fn()
              }
            })),
            transaction: jest.fn((cb) =>
              cb({
                findOne: jest.fn(),
                save: jest.fn()
              })
            )
          }
        }
      ]
    }).compile();

    service = module.get<QuizService>(QuizService);
    quizRepository = module.get<Repository<QuizModel>>(getRepositoryToken(QuizModel));
    quizSetRepository = module.get<Repository<QuizSetModel>>(getRepositoryToken(QuizSetModel));
    quizChoiceRepository = module.get<Repository<QuizChoiceModel>>(
      getRepositoryToken(QuizChoiceModel)
    );
    dataSource = module.get<DataSource>(DataSource);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('repository should be defined', () => {
    expect(quizRepository).toBeDefined();
    expect(quizSetRepository).toBeDefined();
    expect(quizChoiceRepository).toBeDefined();
  });
});
