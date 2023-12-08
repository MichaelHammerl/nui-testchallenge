import { Injectable } from '@nestjs/common';
import { QuestionsRepository } from './infrastructure/repositories/questions.repository';
import { QuestionDto } from './question.dto';

@Injectable()
export class QuestionService {
  constructor(private questionRepository: QuestionsRepository) {}

  async getNextQuestion(answeredKeys?: string[]): Promise<QuestionDto> {
    const nextQuestion = this.questionRepository.getNextQuestion(answeredKeys);

    return nextQuestion;
  }
}
