import {
  Controller,
  Get,
  ParseArrayPipe,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { QuestionDto } from './question.dto';
import { QuestionService } from './question.service';
import { Request, Response } from 'express';

@Controller()
export class QuestionController {
  constructor(private questionService: QuestionService) {}

  @Get('/services')
  async getAvailableServices(
    @Query('keys', new ParseArrayPipe({ items: String, separator: ',' }))
    keys: string[],
    @Query('answers', new ParseArrayPipe({ items: String, separator: ',' }))
    answers: string[],
  ) {
    const answersObj: Record<string, string> = {};
    keys.forEach((key, index) => {
      answersObj[key] = answers[index];
    });
    const services =
      await this.questionService.getAvailableServices(answersObj);
    return services;
  }

  @Get('/questions/next')
  async getNextQuestion(
    @Res()
    res: Response,
    @Req()
    req: Request,
    @Query(
      'keys',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    keys?: string[],
    @Query(
      'answers',
      new ParseArrayPipe({ items: String, separator: ',', optional: true }),
    )
    answers?: string[],
  ): Promise<QuestionDto> {
    const answersObj: Record<string, string> = {};
    keys?.forEach((key, index) => {
      answersObj[key] = answers[index];
    });
    const nextQuestion = await this.questionService.getNextQuestion(answersObj);

    // Redirect to other endpoint, assuming all (relevant) questions have been answered
    if (!nextQuestion) {
      res.redirect(req.url.replace('/question', '/services'));
      return null;
    }
    res.json(nextQuestion);
  }
}
