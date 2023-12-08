import { Controller, Get, ParseArrayPipe, Query } from '@nestjs/common';
import { QuestionDto } from './question.dto';
import { QuestionService } from './question.service';

@Controller()
export class AppController {
  constructor(private questionService: QuestionService) {}

  @Get('/services')
  async getAvailableServices(
    @Query('keys', new ParseArrayPipe({ items: String, separator: ',' }))
    keys: string[],
    @Query('answers', new ParseArrayPipe({ items: String, separator: ',' }))
    answers: string[],
  ) {
    const answersObj: Record<string, string> = {};
    keys.forEach((a, index) => {
      answersObj[a] = answers[index];
    });
    const services =
      await this.questionService.getAvailableServices(answersObj);
    return services;
  }

  @Get('/question')
  async getNextQuestion(
    @Query('keys', new ParseArrayPipe({ items: String, separator: ',' }))
    keys: string[],
    @Query('answers', new ParseArrayPipe({ items: String, separator: ',' }))
    answers: string[],
  ): Promise<QuestionDto> {
    const answersObj: Record<string, string> = {};
    keys.forEach((a, index) => {
      answersObj[a] = answers[index];
    });
    const nextQuestion = await this.questionService.getNextQuestion(answersObj);
    return nextQuestion;
  }
}
