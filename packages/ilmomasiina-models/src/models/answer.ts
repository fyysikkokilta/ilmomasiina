import QuestionAttributes from './question';
import SignupAttributes from './signup';

export default interface AnswerAttributes {
  id: string;
  answer: string | string[];
  questionId: QuestionAttributes['id'];
  signupId: SignupAttributes['id'];
}
