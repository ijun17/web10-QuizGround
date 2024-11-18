import {
  Injectable,
} from '@nestjs/common';
import { CreateQuizSetDto } from '../dto/create-quiz.dto';
import { UpdateQuizSetDto } from '../dto/update-quiz.dto';
import { QuizSetDto, QuizSetList } from '../dto/quiz-set-list-response.dto';
import { QuizSetCreateService } from './quiz-set-create.service';
import { QuizSetReadService } from './quiz-set-read.service';
import { QuizSetUpdateService } from './quiz-set-update.service';
import { QuizSetDeleteService } from './quiz-set-delete.service';

@Injectable()
export class QuizSetService {
  constructor(
    private readonly quizSetCreateService: QuizSetCreateService,
    private readonly quizSetReadService: QuizSetReadService,
    private readonly quizSetUpdateService: QuizSetUpdateService,
    private readonly quizSetDeleteService: QuizSetDeleteService
  ) {}

  /**
   * 퀴즈셋, 퀴즈, 선택지를 생성합니다.
   * @param createQuizSetDto 생성할 퀴즈셋 데이터
   * @returns 생성된 퀴즈셋
   */
  async createQuizSet(dto: CreateQuizSetDto) {
    return this.quizSetCreateService.createQuizSet(dto);
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
    return this.quizSetReadService.findAllWithQuizzesAndChoices(category, offset, limit, search);
  }

  /**
   * 현재 api 명세에 따라 user 정보는 안주는것으로 구현되어있음.
   * 이에따라 test code에서도 user 정보를 test 하지 않음.
   * 향후 필요시 구현가능(relation 옵션 활용)
   * @param id
   */
  async findOne(id: number) {
    return this.quizSetReadService.findOne(id);
  }

  /**
   * 주어진 ID의 퀴즈셋을 소프트 삭제합니다.
   * @param id 삭제할 퀴즈셋의 ID
   * @returns 삭제 결과를 포함한 응답 객체
   */
  async remove(id: number) {
    return this.quizSetDeleteService.remove(id);
  }

  // REFACTOR: QuizSetUpdateService 메서드 분리 필요 및 최적화
  async update(id: number, updateDto: UpdateQuizSetDto) {
    return this.quizSetUpdateService.update(id, updateDto);
  }
}
