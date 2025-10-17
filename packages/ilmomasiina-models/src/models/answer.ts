import type QuestionAttributes from "./question";
import type SignupAttributes from "./signup";

export default interface AnswerAttributes {
  id: string;
  answer: string | string[];
  questionId: QuestionAttributes["id"];
  signupId: SignupAttributes["id"];
}
