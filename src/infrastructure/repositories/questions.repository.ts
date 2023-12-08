import { Inject, Injectable } from '@nestjs/common';
import { app, database } from 'firebase-admin';
import { QuestionDto } from '../../question.dto';

@Injectable()
export class QuestionsRepository {
  db: database.Database;

  rules: {
    rulesByOr: { key: string; value: string; operand: string }[][];
    title: string;
  }[];

  constructor(@Inject('FIREBASE_APP') private firebaseApp: app.App) {
    this.db = firebaseApp.database(
      'https://nui-testchallenge-default-rtdb.europe-west1.firebasedatabase.app',
    );

    this.initRules();
  }

  async initRules() {
    const ref = this.db.ref('services_backend/topics');
    const topics = (await ref.get()).val();

    this.rules = Object.values(topics).map((topic) => {
      const rulesByOR: string[] = topic['rule'].split('||');
      const rulesByAnd = rulesByOR.map((rule) => rule.split('-'));
      const rulesSplit = rulesByAnd.map((ruleSetOr) => {
        return ruleSetOr.map((singleRule) => {
          let [key, value] = singleRule.split('(');
          value = value.slice(0, -1);
          switch (value.charAt(0)) {
            case '>':
              return {
                key,
                operand: '>',
                value: value.slice(1),
              };
            case '<':
              return {
                key,
                operand: '<',
                value: value.slice(1),
              };
            default:
              return {
                key,
                operand: '=',
                value,
              };
          }
        });
      });

      return { rulesByOr: rulesSplit, title: topic['title'].de as string };
    });
  }

  async getServices(answers: Record<string, string>): Promise<string[]> {
    const applicable = this.rules.filter((rule) => {
      return rule.rulesByOr.some((rulesByAnd) => {
        return rulesByAnd.every((singleRule) => {
          return this.checkSingleRule(singleRule, answers);
        });
      });
    });
    return applicable.map((rule) => rule.title);
  }

  private checkSingleRule(
    { key, value, operand }: { key: string; value: string; operand: string },
    answers: Record<string, string>,
  ) {
    if (!(key in answers)) {
      return false;
    }
    switch (operand) {
      case '=':
        return answers[key] === value;
      case '>':
        return answers[key] > value;
      case '<':
        return answers[key] < value;
    }
  }

  getRelevantQuestions(answers: Record<string, string>): Set<string> {
    const filtered = this.rules.filter((rule) => {
      return rule.rulesByOr.some((rulesByAnd) => {
        return rulesByAnd.every((singleRule) => {
          if (!(singleRule.key in answers)) {
            return true;
          }
          return this.checkSingleRule(singleRule, answers);
        });
      });
    });

    const relevantKeys: Set<string> = new Set();

    filtered.forEach((rule) => {
      rule.rulesByOr.forEach((r) => {
        r.forEach((a) => {
          relevantKeys.add(a.key);
        });
      });
    });

    return relevantKeys;
  }

  async getNextQuestion(answers: Record<string, string>): Promise<QuestionDto> {
    const ref = this.db.ref('services_backend/questions');
    const relevantQuestionKeys = this.getRelevantQuestions(answers);

    const questions = (await ref.get()).val();
    for (const key in questions) {
      if (!(key in answers) && relevantQuestionKeys.has(key)) {
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
