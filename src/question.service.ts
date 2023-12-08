import { Injectable } from '@nestjs/common';
import { QuestionsRepository } from './infrastructure/repositories/questions.repository';
import { QuestionDto } from './question.dto';

@Injectable()
export class QuestionService {
  constructor(private questionRepository: QuestionsRepository) {}

  async getAvailableServices(
    answers: Record<string, string>,
  ): Promise<string[]> {
    return this.questionRepository.getServices(answers);
  }

  async getNextQuestion(answers: Record<string, string>): Promise<QuestionDto> {
    return this.questionRepository.getNextQuestion(answers);
  }
}
