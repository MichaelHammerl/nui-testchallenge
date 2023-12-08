import { Inject, Injectable } from '@nestjs/common';
import { app, database } from 'firebase-admin';
import { QuestionDto } from '../../question.dto';

@Injectable()
export class QuestionsRepository {
  db: database.Database;
  ref: database.Reference;

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.db = firebaseApp.database(
      'https://nui-testchallenge-default-rtdb.europe-west1.firebasedatabase.app',
    );

    this.ref = this.db.ref('services_backend/questions');
  }

  async getNextQuestion(answeredKeys?: string[]): Promise<QuestionDto> {
    const questions = (await this.ref.get()).val();
    for (const key in questions) {
      if (!answeredKeys?.includes(key)) {
        console.log(questions[key]);
        return {
          nextQuestion: {
            key,
            title: questions[key].title[0],
            options: Object.values(questions[key].answers),
          },
        };
      }
    }

    return null;
  }
}
