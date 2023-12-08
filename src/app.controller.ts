import { Controller, Get, ParseArrayPipe, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { QuestionDto } from './question.dto';
import { QuestionService } from './question.service';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private questionService: QuestionService,
  ) {}

  @Get()
  async getAvailableServices(
    @Query('keys', new ParseArrayPipe({ items: String, separator: ',' }))
    keys: string[],
    @Query('answers', new ParseArrayPipe({ items: String, separator: ',' }))
    answers: string[],
  ): Promise<QuestionDto> {
    const nextQuestion = await this.questionService.getNextQuestion(keys);
    return nextQuestion;
  }
}
