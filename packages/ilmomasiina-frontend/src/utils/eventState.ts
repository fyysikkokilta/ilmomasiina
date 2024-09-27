import type { AdminEventListItem } from "@tietokilta/ilmomasiina-models";

/** Determines the effective end date of the event, matching the scope logic in `backend/src/models/event`. */
function getEffectiveEndDate(event: Pick<AdminEventListItem, "date" | "endDate" | "registrationEndDate">) {
  const endDates = [event.endDate, event.date, event.registrationEndDate]
    .filter((date): date is string => date != null)
    .map((date) => new Date(date).getTime());
  if (!endDates.length) return null;
  return endDates.reduce((lhs, rhs) => Math.max(lhs, rhs));
}

/** Checks whether the event's effective end date is before now. */
export function isEventInPast(event: Pick<AdminEventListItem, "date" | "endDate" | "registrationEndDate">) {
  const endDate = getEffectiveEndDate(event);
  return endDate != null && endDate < Date.now();
}

/** Checks whether the event is hidden from regular users due to the scope logic in  `backend/src/models/event`. */
export function isEventHiddenFromUsersDueToAge(
  event: Pick<AdminEventListItem, "date" | "endDate" | "registrationEndDate">,
) {
  const endDate = getEffectiveEndDate(event);
  return endDate != null && endDate < Date.now() - 7 * 24 * 60 * 60 * 1000;
}
