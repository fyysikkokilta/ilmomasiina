import type { AdminEventListItem } from "@tietokilta/ilmomasiina-models";

// eslint-disable-next-line import/prefer-default-export
export function isEventInPast(event: Pick<AdminEventListItem, "date" | "endDate" | "registrationEndDate">) {
  const endDate = event.endDate ?? event.date ?? event.registrationEndDate;
  return endDate != null && new Date(endDate) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
}
