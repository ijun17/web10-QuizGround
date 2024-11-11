import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  UpdateDateColumn
} from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { UserModel } from '../../user/entities/user.entity';
import { QuizModel } from './quiz.entity';
import { UserQuizArchiveModel } from '../../user/entities/user-quiz-archive.entity';

@Entity('quiz_set')
export class QuizSetModel extends BaseModel {
  @Column()
  title: string;

  @Column({ name: 'user_id' })
  userId: number;

  @Column()
  category: string;

  @Column({ name: 'quiz_category_id' })
  quizCategoryId: number;

  @ManyToOne(() => UserModel, (user) => user.quizSets)
  @JoinColumn({ name: 'user_id' })
  user: UserModel;

  @OneToMany(() => QuizModel, (quiz) => quiz.quizSet)
  quizzes: QuizModel[];

  @OneToMany(() => UserQuizArchiveModel, (archive) => archive.quizSet)
  archives: UserQuizArchiveModel[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
