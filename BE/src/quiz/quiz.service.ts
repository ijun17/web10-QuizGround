import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateQuizDto } from './dto/create-quiz.dto';
import { UpdateQuizDto } from './dto/update-quiz.dto';
import { QuizModel } from './entities/quiz.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { QuizSetModel } from './entities/quiz-set.entity';
import { QuizChoiceModel } from './entities/quiz-choice.entity';

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

  findAll() {
    const quizSets = this.quizSetRepository.find();
    return quizSets;
  }

  async findOne(id: number) {
    const quizSet = await this.quizSetRepository.findOne({
      where: {
        id
      }
    });
    if (!quizSet) {
      throw new NotFoundException('Not Found quizSet');
    }
    return quizSet;
  }

  update(id: number, updateQuizDto: UpdateQuizDto) {
    return `This action updates a #${id} quiz`;
  }

  remove(id: number) {
    return `This action removes a #${id} quiz`;
  }
}
