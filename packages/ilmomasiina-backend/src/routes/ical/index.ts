import { FastifyReply, FastifyRequest } from "fastify";
import { createEvent, createEvents, DateArray, EventAttributes } from "ics";

import config, { eventDetailsUrl } from "../../config";
import { getDb } from "../../db";
import { Event, userEventFilter } from "../../models/event";
import createCache from "../../util/cache";

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
const uidDomain = config.icalUidDomain || new URL(config.baseUrl).hostname;

/** Length given in iCalendar files to events that have no end date. */
const DEFAULT_EVENT_DURATION_MS = 60 * 60 * 1000;

/** An event that has a start date, and can thus be exported to iCalendar. */
export type ICalExportableEvent = Event & { date: Date };

/** Checks whether an event can be exported to iCalendar, i.e. is not signup-only. */
export function isICalExportable(event: Event): event is ICalExportableEvent {
  return event.date != null;
}

/** Builds iCalendar attributes for an event, using the event's version in the given language if it has one. */
export function icsAttrsFromEvent(event: ICalExportableEvent, lang: string = config.defaultLanguage): EventAttributes {
  // Empty fields in a language version fall back to the event's default language.
  const locale = Object.hasOwn(event.languages, lang) ? event.languages[lang] : undefined;
  return {
    calName: config.icalCalendarName,
    uid: `${event.id}@${uidDomain}`,
    start: dateToArray(event.date),
    startInputType: "utc",
    end: dateToArray(event.endDate ?? new Date(event.date.getTime() + DEFAULT_EVENT_DURATION_MS)),
    endInputType: "utc",
    title: locale?.title || event.title,
    description: locale?.description || event.description || undefined, // TODO convert markdown
    location: locale?.location || event.location || undefined,
    categories: event.category ? [event.category] : undefined,
    url: eventDetailsUrl({ slug: event.slug, lang, frontend: event.preferredFrontend }),
  };
}

/** Generates an iCalendar file for a single event in the given language. Throws if generation fails. */
export const eventAsICalCached = createCache({
  maxAgeMs: 60 * 60 * 1000,
  // Safe in tests, as entries can never be stale (see formatKey).
  allowTesting: true,
  logName: "eventAsICalCached",
  // updatedAt changes with every save of the event, so an edited event never gets a stale file.
  formatKey: ({ event, lang }) => `${event.id}:${lang}:${event.updatedAt.getTime()}`,
  async get({ event, lang }: { event: ICalExportableEvent; lang: string }) {
    const { error, value } = createEvent(icsAttrsFromEvent(event, lang));
    if (error != null) throw new Error(`Failed to generate iCalendar: ${error}`);
    if (value == null) throw new Error("Failed to generate iCalendar");
    return value;
  },
});

export async function eventsAsICal() {
  const events = await getDb().query.event.findMany({
    where: {
      AND: [
        userEventFilter(),
        {
          listed: true,
          // only events, not signup-only
          date: { isNotNull: true },
        },
      ],
    },
    orderBy: { date: "asc", registrationEndDate: "asc", title: "asc" },
  });

  const { error, value } = createEvents(events.filter(isICalExportable).map((event) => icsAttrsFromEvent(event)));

  if (error != null) throw new Error(`Failed to generate iCalendar: ${error}`);
  if (value == null) throw new Error("Failed to generate iCalendar");
  return value;
}

const eventsAsICalCached = createCache({
  maxAgeMs: 60 * 1000,
  logName: "eventsAsICalCached",
  get: eventsAsICal,
});

export async function sendICalFeed(request: FastifyRequest, reply: FastifyReply): Promise<string> {
  // Generate iCal content (as a string)
  const cal = await eventsAsICalCached(undefined);

  reply.status(200);
  reply.type("text/calendar"); // Set proper content type header
  return cal;
}
