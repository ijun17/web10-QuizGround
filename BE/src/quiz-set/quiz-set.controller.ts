import {
  Body,
  Controller,
  DefaultValuePipe,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuizSetService } from './service/quiz-set.service';
import { UpdateQuizSetDto } from './dto/update-quiz.dto';
import { CreateQuizSetDto } from './dto/create-quiz.dto';
import { JwtAuthGuard } from '../auth/guard/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserModel } from '../user/entities/user.entity';

@Controller('/api/quiz-set')
export class QuizSetController {
  constructor(private readonly quizService: QuizSetService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: '퀴즈셋 생성' })
  @ApiResponse({ status: 201, description: '퀴즈셋이 성공적으로 생성됨' })
  @ApiResponse({ status: 400, description: '잘못된 입력값' })
  async createQuizSet(@Body() createQuizSetDto: CreateQuizSetDto, @CurrentUser() user: UserModel) {
    return this.quizService.createQuizSet(createQuizSetDto, user);
  }

  @Get()
  findAll(
    @Query('category', new DefaultValuePipe('')) category: string,
    @Query('cursor', new DefaultValuePipe(1), ParseIntPipe) cursor: number,
    @Query('take', new DefaultValuePipe(10), ParseIntPipe) take: number,
    @Query('search', new DefaultValuePipe('')) search: string
  ) {
    return this.quizService.findAllWithQuizzesAndChoices(category, cursor, take, search);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(+id);
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateQuizSetDto: UpdateQuizSetDto,
    @CurrentUser() user: UserModel
  ) {
    return this.quizService.update(+id, updateQuizSetDto, user);
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: UserModel) {
    return this.quizService.remove(+id, user);
  }
}
