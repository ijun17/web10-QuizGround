import {
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { DataSource } from 'typeorm';
import { QuizSetModel } from '../entities/quiz-set.entity';
import { UpdateQuizSetDto } from '../dto/update-quiz.dto';
import { QuizModel } from '../entities/quiz.entity';
import { QuizChoiceModel } from '../entities/quiz-choice.entity';

@Injectable()
export class QuizSetUpdateService {
  constructor(
    private dataSource: DataSource,
  ) {
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
