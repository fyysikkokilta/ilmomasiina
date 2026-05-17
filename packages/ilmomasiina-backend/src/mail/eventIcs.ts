import { createEvents, DateArray } from "ics";

import config, { eventDetailsUrl } from "../config";
import { Event } from "../models/event";

function dateToArray(date: Date) {
  return [
    date.getUTCFullYear(),
    date.getUTCMonth() + 1,
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
  ] as DateArray;
}

/** Domain name for generating iCalendar UIDs.
 * @see https://datatracker.ietf.org/doc/html/rfc5545#section-3.8.4.7
 */
const uidDomain = config.icalUidDomain || new URL(config.baseUrl ?? "http://localhost").hostname;

export async function eventToICS(event: Event) {
  const { error, value } = createEvents([
    {
      calName: config.icalCalendarName,
      uid: `${event.id}@${uidDomain}`,
      start: dateToArray(event.date!),
      startInputType: "utc",
      end: dateToArray(new Date(event.endDate!)),
      endInputType: "utc",
      title: event.title,
      description: event.description || undefined, // TODO convert markdown
      location: event.location || undefined,
      categories: event.category ? [event.category] : undefined,
      url: eventDetailsUrl({ slug: event.slug, lang: config.defaultLanguage }),
    },
  ]);

  if (error !== null) throw new Error(`Failed to generate iCalendar: ${error}`);
  return value;
}
