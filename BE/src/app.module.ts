import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GameModule } from './game/game.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizModule } from './quiz/quiz.module';
import { UserModule } from './user/user.module';
import * as dotenv from 'dotenv';

dotenv.config({ path: '../.env' });

@Module({
  imports: [
    GameModule,
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: +process.env.DB_PORT || 3306,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWD,
      database: process.env.DB_NAME,
      entities: [],
      synchronize: false, // 개발 모드에서만 활성화
      logging: true, // 모든 쿼리 로깅
      logger: 'advanced-console'
    }),
    QuizModule,
    UserModule
  ],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
