export interface QuestionDto {
  nextQuestion: NextQuestionDto;
}

export interface NextQuestionDto {
  key: string;
  title: string;
  options: NextQuestionTitleDto[];
}

export interface NextQuestionTitleDto {
  title: string;
  result: string;
}
