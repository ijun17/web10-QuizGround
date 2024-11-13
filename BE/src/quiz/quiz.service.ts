import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizModel } from './entities/quiz.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizSetModel } from './entities/quiz-set.entity';
import { QuizChoiceModel } from './entities/quiz-choice.entity';
import { Result } from './dto/Response.dto';
import { groupBy } from 'lodash';

@Injectable()
export class QuizService {
  constructor(
    @InjectRepository(QuizModel)
    private readonly quizRepository: Repository<QuizModel>,
    @InjectRepository(QuizSetModel)
    private readonly quizSetRepository: Repository<QuizSetModel>,
    @InjectRepository(QuizChoiceModel)
    private readonly quizChoiceRepository: Repository<QuizChoiceModel>
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
}
