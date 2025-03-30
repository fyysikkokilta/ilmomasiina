import EventAttributes from "./event";

export interface QuotaLanguage {
  title: string;
}

export default interface QuotaAttributes extends QuotaLanguage {
  id: string;
  order: number;
  size: number | null;
  eventId: EventAttributes["id"];
  languages: Record<string, Partial<QuotaLanguage>>;
  signupCount?: number;
}
