import { Inject, Injectable } from '@nestjs/common';
import { app, database } from 'firebase-admin';
import { QuestionDto } from '../../question.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QuestionRepository {
  db: database.Database;

  /**
   * Ruleset tokenized
   *    Top level Array contains elements split by OR (||)
   *    Second level split by AND (-)
   *    Third level each single rule with an operand (=,>,<)
   */
  rulesSet: {
    rulesByOr: { key: string; value: string; operand: string }[][];
    title: string;
  }[];

  constructor(
    @Inject('FIREBASE_APP') private firebaseApp: app.App,
    private configService: ConfigService,
  ) {
    this.db = firebaseApp.database(
      this.configService.get<string>('DATABASE_URL'),
    );

    this.initRules();
  }

  /**
   * Reads all rules from Firebase and tokenizes the query strings.
   * Creates an Array with three levels 1. Rules separated by OR 2. Rules separated by AND 3. Single Rule and it's comparison mode (=, >, <)
   */
  async initRules() {
    const ref = this.db.ref('services_backend/topics');
    const topics = (await ref.get()).val();

    this.rulesSet = Object.values(topics).map((topic) => {
      const rulesByOR: string[] = topic['rule'].split('||');
      const rulesByAnd = rulesByOR.map((rule) => rule.split('-'));
      const rulesSplit = rulesByAnd.map((ruleSetByOr) => {
        return ruleSetByOr.map((singleRule) => {
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

  getAvailableServiceTitles(answers: Record<string, string>): string[] {
    const applicable = this.findApplicableServices(answers, true);

    return applicable.map((rule) => rule.title);
  }

  async getNextQuestion(answers: Record<string, string>): Promise<QuestionDto> {
    const ref = this.db.ref('services_backend/questions');
    const questions = (await ref.get()).val();

    const relevantQuestionKeys = this.getRelevantQuestions(answers);

    for (const key in questions) {
      // Only provide a question if it hasn't been answered and if it is decisive
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

  /**
   * Returns a list of all services that match the completed answers
   * @param answers     Record of already answered questions
   * @param exactMatch  If true, only services are returned that have all their answers completed. Otherwise, it will return services that might be applicable, depending on future answers
   */
  findApplicableServices(answers: Record<string, string>, exactMatch = false) {
    return this.rulesSet.filter(({ rulesByOr }) => {
      return rulesByOr.some((rulesByAnd) => {
        return rulesByAnd.every((singleRule) => {
          if (!exactMatch && !(singleRule.key in answers)) {
            return true;
          }
          return this.isRuleSatisfied(singleRule, answers);
        });
      });
    });
  }

  isRuleSatisfied(
    { key, value, operand }: { key: string; value: string; operand: string },
    answers: Record<string, string>,
  ): boolean {
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

  /**
   * Finds all remaining questions that are decisive for the matching services
   * @param answers Record of already answered questions
   */
  getRelevantQuestions(answers: Record<string, string>): Set<string> {
    const applicableServices = this.findApplicableServices(answers);

    const relevantKeys: Set<string> = new Set();

    applicableServices.forEach(({ rulesByOr }) => {
      rulesByOr.forEach((rulesByAnd) => {
        rulesByAnd.forEach((singleRule) => {
          relevantKeys.add(singleRule.key);
        });
      });
    });

    return relevantKeys;
  }
}
