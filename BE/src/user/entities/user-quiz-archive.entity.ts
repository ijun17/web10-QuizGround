import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { QuizSetModel } from '../../quiz/entities/quiz-set.entity';
import { UserModel } from './user.entity';

enum GameMode {
  SURVIVAL = 'SURVIVAL',
  RANKING = 'RANKING'
}

@Entity('user_quiz_archive')
export class UserQuizArchiveModel extends BaseModel {
  @Column({ name: 'user_id', type: 'bigint' })
  userId: number;

  @Column({ name: 'quiz_set_id', type: 'bigint' })
  quizSetId: number;

  @Column({
    name: 'game_mode',
    type: 'varchar',
    enum: GameMode
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

  @ManyToOne(() => UserModel, (user) => user.quizArchives)
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @ManyToOne(() => QuizSetModel)
  @JoinColumn({ name: 'quiz_set_id' })
  quizSet: QuizSetModel;
}
