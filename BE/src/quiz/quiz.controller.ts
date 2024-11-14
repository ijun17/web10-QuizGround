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
  Query
} from '@nestjs/common';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';
import { QuizService } from './quiz.service';
import { UpdateQuizSetDto } from './dto/update-quiz.dto';
import { CreateQuizSetDto } from './dto/create-quiz.dto';

@Controller('/api/quizset')
export class QuizController {
  constructor(private readonly quizService: QuizService) {}

  @Post()
  @ApiOperation({ summary: '퀴즈셋 생성' })
  @ApiResponse({ status: 201, description: '퀴즈셋이 성공적으로 생성됨' })
  @ApiResponse({ status: 400, description: '잘못된 입력값' })
  async createQuizSet(@Body() createQuizSetDto: CreateQuizSetDto) {
    return this.quizService.createQuizSet(createQuizSetDto);
  }

  @Get()
  findAll(
    @Query('category') category: string,
    @Query('offset', new DefaultValuePipe(0), ParseIntPipe) offset: number,
    @Query('size', new DefaultValuePipe(10), ParseIntPipe) limit: number
  ) {
    return this.quizService.findAllWithQuizzesAndChoices(category, offset, limit);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.quizService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateQuizSetDto: UpdateQuizSetDto) {
    return this.quizService.update(+id, updateQuizSetDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.quizService.remove(+id);
  }
}
