import type {
  SignupForEdit,
  SignupForEditResponse,
  UserEventListItem,
  UserEventResponse,
} from "@tietokilta/ilmomasiina-models";

type EventForEditSignup = SignupForEditResponse["event"];

/** Overrides localized properties in the event and quotas with localized versions.
 *
 * If the language version is not found (including invalid languages), falls back to the default language.
 */
/** Servers before 2.0.0-alpha42 may omit languages and quotas, so treat them as optional here. */
type MaybeLocalized<L> = { languages?: Partial<Record<string, L>> };

export function getLocalizedEventListItem(event: UserEventListItem, language: string): UserEventListItem {
  const { languages } = event as MaybeLocalized<UserEventListItem["languages"][string]>;
  const locale = languages?.[language] ?? event;
  return {
    ...event,
    title: locale.title || event.title,
    location: locale.location || event.location,
    price: locale.price || event.price,
    webpageUrl: locale.webpageUrl || event.webpageUrl,
    facebookUrl: locale.facebookUrl || event.facebookUrl,
    description: locale.description || event.description,
    quotas: event.quotas.map((quota, index) => ({
      ...quota,
      title: locale.quotas[index]?.title || quota.title,
    })),
  };
}

/** Overrides localized properties in the event, quotas and questions with localized versions.
 *
 * If the language version is not found (including invalid languages), falls back to the default language.
 */
export function getLocalizedEvent(event: UserEventResponse, language: string): UserEventResponse;
export function getLocalizedEvent(event: EventForEditSignup, language: string): EventForEditSignup;
export function getLocalizedEvent(
  event: UserEventResponse | EventForEditSignup,
  language: string,
): UserEventResponse | EventForEditSignup {
  const { languages } = event as MaybeLocalized<(typeof event.languages)[string]>;
  const locale = languages?.[language] ?? event;
  const { quotas } = event as { quotas?: typeof event.quotas };
  return {
    ...event,
    title: locale.title || event.title,
    location: locale.location || event.location,
    price: locale.price || event.price,
    webpageUrl: locale.webpageUrl || event.webpageUrl,
    facebookUrl: locale.facebookUrl || event.facebookUrl,
    description: locale.description || event.description,
    questions: event.questions.map((question, index) => ({
      ...question,
      question: locale.questions[index]?.question || question.question,
      options:
        question.options?.map((option, optIndex) => locale.questions[index]?.options?.[optIndex] || option) ?? null,
    })),
    quotas:
      // Servers prior to 2.0.0-alpha42 do not return quotas in EventForEditSignup.
      quotas?.map((quota, index) => ({
        ...quota,
        title: locale.quotas[index]?.title || quota.title,
      })) ?? [],
  };
}

/** Overrides localized properties in the quota of the edited signup with localized versions.
 *
 * If the language version is not found (including invalid languages), falls back to the default language.
 */
export function getLocalizedSignup({ event, signup }: SignupForEditResponse, language: string): SignupForEdit {
  const { languages } = event as MaybeLocalized<(typeof event.languages)[string]>;
  const locale = languages?.[language];
  // Short circuit: don't attempt anything if we don't have the locale.
  if (!locale) return signup;
  // This is a bit unfortunate, but we have to find the quota manually.
  const quotaIndex = event.quotas.findIndex((q) => q.id === signup.quota.id);
  return {
    ...signup,
    quota: {
      ...signup.quota,
      title: locale.quotas[quotaIndex]?.title ?? signup.quota.title,
    },
  };
}
