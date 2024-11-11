import { QuizChoiceModel } from './entities/quiz-choice.entity';
import { QuizSetModel } from './entities/quiz-set.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizModel } from './entities/quiz.entity';
import { QuizService } from './quiz.service';
import { Test, TestingModule } from '@nestjs/testing';

describe('QuizService', () => {
  let quizService: QuizService;
  let quizRepository: Repository<QuizModel>;
  let quizSetRepository: Repository<QuizSetModel>;
  let quizChoiceRepository: Repository<QuizChoiceModel>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QuizService,
        {
          provide: getRepositoryToken(QuizModel),
          useValue: {
            findOne: jest.fn()
          }
        },
        {
          provide: getRepositoryToken(QuizSetModel),
          useValue: {
            findOne: jest.fn()
          }
        },
        {
          provide: getRepositoryToken(QuizChoiceModel),
          useValue: {
            findOne: jest.fn()
          }
        }
      ]
    }).compile();

    quizService = module.get<QuizService>(QuizService);
    quizRepository = module.get<Repository<QuizModel>>(getRepositoryToken(QuizModel));
    quizSetRepository = module.get<Repository<QuizSetModel>>(getRepositoryToken(QuizSetModel));
    quizChoiceRepository = module.get<Repository<QuizChoiceModel>>(
      getRepositoryToken(QuizChoiceModel)
    );
  });

  describe('findOne', () => {
    it('ID로 알맞은 퀴즈셋을 찾아야 한다.', async () => {
      // Given
      const id = 1;
      // 테스트용 Mock 데이터
      const mockQuizSet: QuizSetModel = {
        id: 1,
        title: 'Test Quiz',
        userId: 1,
        category: 'TEST',
        quizCategoryId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        user: null,
        quizzes: [],
        archives: []
      } as QuizSetModel;

      jest.spyOn(quizSetRepository, 'findOne').mockResolvedValue(mockQuizSet);

      // When
      const result = await quizService.findOne(id);

      // Then
      expect(result).toBeDefined();
      expect(result).toEqual(mockQuizSet);
      expect(quizSetRepository.findOne).toHaveBeenCalledWith({
        where: { id }
      });
    });
  });
});
