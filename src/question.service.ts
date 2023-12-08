import { Injectable } from '@nestjs/common';
import { QuestionRepository } from './infrastructure/repositories/question.repository';
import { QuestionDto } from './question.dto';

@Injectable()
export class QuestionService {
  constructor(private questionRepository: QuestionRepository) {}

  async getAvailableServices(
    answers: Record<string, string>,
  ): Promise<string[]> {
    return this.questionRepository.getAvailableServiceTitles(answers);
  }

  async getNextQuestion(answers: Record<string, string>): Promise<QuestionDto> {
    return this.questionRepository.getNextQuestion(answers);
  }
}
