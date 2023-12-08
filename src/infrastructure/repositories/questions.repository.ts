import { Inject, Injectable } from '@nestjs/common';
import { app, database } from 'firebase-admin';

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

  async getNextQuestion() {
    const a = await this.ref.get();
    console.log(a.numChildren());
  }
}
