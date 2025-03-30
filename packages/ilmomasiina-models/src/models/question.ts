import { QuestionType } from "../enum";
import EventAttributes from "./event";

export interface QuestionLanguage {
  question: string;
  options: string[] | null;
}

export default interface QuestionAttributes extends QuestionLanguage {
  id: string;
  order: number;
  type: QuestionType;
  required: boolean;
  public: boolean;
  languages: Record<string, Partial<QuestionLanguage>>;
  eventId: EventAttributes["id"];
}
