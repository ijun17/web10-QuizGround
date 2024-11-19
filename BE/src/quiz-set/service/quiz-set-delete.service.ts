import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { QuizModel } from '../entities/quiz.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, EntityManager, IsNull, QueryFailedError, Repository } from 'typeorm';
import { QuizSetModel } from '../entities/quiz-set.entity';
import { QuizChoiceModel } from '../entities/quiz-choice.entity';
import { QuizSetCreateService } from './quiz-set-create.service';
import { QuizSetReadService } from './quiz-set-read.service';

@Injectable()
export class QuizSetDeleteService {
  constructor(
    private dataSource: DataSource,
  ) {
  }

  /**
   * 주어진 ID의 퀴즈셋을 소프트 삭제합니다.
   * @param id 삭제할 퀴즈셋의 ID
   * @returns 삭제 결과를 포함한 응답 객체
   */
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
}
