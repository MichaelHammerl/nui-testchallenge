import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { QuestionsRepository } from './infrastructure/repositories/questions.repository';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private questionRepository: QuestionsRepository,
  ) {}

  @Get()
  async getHello() {
    await this.questionRepository.getNextQuestion();
    return this.appService.getHello();
  }
}
