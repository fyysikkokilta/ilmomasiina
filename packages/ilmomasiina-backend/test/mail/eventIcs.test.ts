import { describe, expect, test } from "vitest";

import { Event } from "../../src/models/event";
import { eventToICS } from "../../src/mail/eventIcs";

describe("eventToICS", () => {
  test("generates valid ICS for an event with all fields", async () => {
    const event = {
      id: 1,
      title: "Test Event",
      date: new Date("2026-06-01T18:00:00Z"),
      endDate: new Date("2026-06-01T20:00:00Z"),
      location: "Room 101",
      description: "Event details here",
      slug: "test-event",
      category: "Social",
    } as Event;

    const ics = await eventToICS(event);

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("SUMMARY:Test Event");
    expect(ics).toContain("LOCATION:Room 101");
    expect(ics).toContain("END:VCALENDAR");
  });

  test("omits optional fields when null", async () => {
    const event = {
      id: 2,
      title: "Minimal Event",
      date: new Date("2026-07-01T12:00:00Z"),
      endDate: null,
      location: null,
      description: null,
      slug: "minimal",
      category: null,
    } as Event;

    const ics = await eventToICS(event);

    expect(ics).toContain("SUMMARY:Minimal Event");
    expect(ics).not.toContain("LOCATION:");
  });
});