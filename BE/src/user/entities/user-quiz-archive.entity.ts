import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { QuizSetModel } from '../../quiz-set/entities/quiz-set.entity';
import { UserModel } from './user.entity';
import { GameMode } from '../../common/constants/game-mode';

@Entity('user_quiz_archive')
export class UserQuizArchiveModel extends BaseModel {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'quiz_set_id', type: 'bigint' })
  quizSetId: number;

  @Column({
    type: 'enum', // varchar가 아닌 enum 사용
    enum: GameMode, //  ['SURVIVAL', 'RANKING']
    default: GameMode.RANKING // 기본값 설정
  })
  gameMode: GameMode;

  @Column({ name: 'player_count', type: 'integer' })
  playerCount: number;

  @Column({ type: 'integer' })
  rank: number;

  @Column({ type: 'integer' })
  score: number;

  @Column({ name: 'played_at', type: 'timestamp' })
  playedAt: Date;

  @ManyToOne(() => UserModel, (user) => user.quizArchiveList, {
    lazy: true
  })
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @ManyToOne(() => QuizSetModel, {
    lazy: true
  })
  @JoinColumn({ name: 'quiz_set_id' })
  quizSet: QuizSetModel;
}
