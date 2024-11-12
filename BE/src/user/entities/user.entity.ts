import { Column, Entity, OneToMany } from 'typeorm';
import { BaseModel } from '../../common/entity/base.entity';
import { Exclude } from 'class-transformer';
import { QuizSetModel } from '../../quiz/entities/quiz-set.entity';
import { UserQuizArchiveModel } from './user-quiz-archive.entity';

@Entity('user')
export class UserModel extends BaseModel {
  @Column({ unique: true })
  email: string;

  @Column()
  @Exclude() //직렬화 대상에서 제외
  password: string;

  @Column()
  nickname: string;

  @Column({ name: 'profile_image', nullable: true })
  profileImage: string;

  @Column({ default: 0 })
  point: number;

  @Column()
  status: string;

  @Column({ name: 'last_login_at', nullable: true })
  lastLoginAt: Date;

  @OneToMany(() => QuizSetModel, (quizSet) => quizSet.user)
  quizSetList: QuizSetModel[];

  @OneToMany(() => UserQuizArchiveModel, (archive) => archive.user)
  quizArchiveList: UserQuizArchiveModel[];
}
