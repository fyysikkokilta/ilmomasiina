import type { SignupForEdit, SignupForEditResponse, UserEventResponse } from "@tietokilta/ilmomasiina-models";

type EventForEditSignup = SignupForEditResponse["event"];

/** Overrides localized properties in the event, quotas and questions with localized versions. */
export function getLocalizedEvent<E extends UserEventResponse | EventForEditSignup>(event: E, language: string): E {
  const locale = event.languages[language] ?? event;
  return {
    ...event,
    title: locale.title,
    location: locale.location,
    price: locale.price,
    webpageUrl: locale.webpageUrl,
    facebookUrl: locale.facebookUrl,
    description: locale.description,
    questions: event.questions.map((question, index) => ({
      ...question,
      question: locale.questions[index]?.question || question.question,
      options: locale.questions[index]?.options || question.options,
    })),
    quotas: event.quotas.map((quota, index) => ({
      ...quota,
      title: locale.quotas[index]?.title || quota.title,
    })),
  };
}

/** Overrides localized properties in the quota of the edited signup with localized versions. */
export function getLocalizedQuotaForEditSignup(
  { event, signup: { quota } }: SignupForEditResponse,
  language: string,
): SignupForEdit["quota"] {
  const locale = event.languages[language];
  // Short circuit: don't attempt anything if we don't have the locale.
  if (!locale) return quota;
  // This is a bit unfortunate, but we have to find the quota manually.
  const quotaIndex = event.quotas.findIndex((q) => q.id === quota.id);
  return {
    ...quota,
    title: locale.quotas[quotaIndex]?.title ?? quota.title,
  };
}
