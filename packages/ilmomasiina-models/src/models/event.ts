export interface EventLanguage {
  title: string;
  description: string | null;
  price: string | null;
  location: string | null;
  webpageUrl: string | null;
  facebookUrl: string | null;
  verificationEmail: string | null;
}

export default interface EventAttributes extends EventLanguage {
  id: string;
  slug: string;
  date: Date | null;
  endDate: Date | null;
  registrationStartDate: Date | null;
  registrationEndDate: Date | null;
  openQuotaSize: number;
  category: string;
  draft: boolean;
  listed: boolean;
  signupsPublic: boolean;
  nameQuestion: boolean;
  emailQuestion: boolean;
  languages: Record<string, Partial<EventLanguage>>;
  defaultLanguage: string;
  updatedAt: Date;
}
