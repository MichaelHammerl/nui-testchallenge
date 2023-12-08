import { Test, TestingModule } from '@nestjs/testing';
import { QuestionRepository } from './question.repository';
import { ConfigService } from '@nestjs/config';

describe('AppController', () => {
  let questionRepository: QuestionRepository;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [],
      providers: [
        QuestionRepository,
        {
          provide: 'FIREBASE_APP',
          useValue: {
            database: jest.fn().mockReturnValue({
              ref: jest.fn().mockReturnValue({
                get: jest
                  .fn()
                  .mockResolvedValue({ val: jest.fn().mockReturnValue([]) }),
              }),
            }),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn(),
          },
        },
      ],
    }).compile();

    questionRepository = app.get<QuestionRepository>(QuestionRepository);
  });

  describe('QuestionRepository', () => {
    describe('checkSingleRule', () => {
      it('return true if rule is fulfilled by equal', () => {
        const result = questionRepository.isRuleSatisfied(
          { key: 'someKey', value: 'someValue', operand: '=' },
          { someKey: 'someValue' },
        );

        expect(result).toEqual(true);
      });

      it('return false if rule is not fulfilled by equal', () => {
        const result = questionRepository.isRuleSatisfied(
          { key: 'someKey', value: 'someValue', operand: '=' },
          { someKey: 'someOtherValue' },
        );

        expect(result).toEqual(false);
      });

      it('return true if rule is fulfilled by greater than', () => {
        const result = questionRepository.isRuleSatisfied(
          { key: 'someKey', value: '5', operand: '>' },
          { someKey: '6' },
        );

        expect(result).toEqual(true);
      });

      it('return false if rule is not fulfilled by greater than', () => {
        const result = questionRepository.isRuleSatisfied(
          { key: 'someKey', value: '5', operand: '>' },
          { someKey: '3' },
        );

        expect(result).toEqual(false);
      });

      it('return true if rule is fulfilled by lower than', () => {
        const result = questionRepository.isRuleSatisfied(
          { key: 'someKey', value: '5', operand: '<' },
          { someKey: '3' },
        );

        expect(result).toEqual(true);
      });

      it('return false if rule is not fulfilled by lower than', () => {
        const result = questionRepository.isRuleSatisfied(
          { key: 'someKey', value: '5', operand: '<' },
          { someKey: '6' },
        );

        expect(result).toEqual(false);
      });

      it.skip('throws an Exception for unknown operand', () => {
        expect(() => {
          questionRepository.isRuleSatisfied(
            { key: 'someKey', value: '5', operand: '+' },
            { someKey: '6' },
          );
        }).toThrow(Error);
      });

      it.skip('throws an Exception for invalid greater than comparison', () => {
        expect(() => {
          questionRepository.isRuleSatisfied(
            { key: 'someKey', value: '5', operand: '>' },
            { someKey: 'InvalidAnswer' },
          );
        }).toThrow(Error);
      });
    });
  });
});
