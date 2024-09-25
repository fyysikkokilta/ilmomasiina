import { Type } from "@sinclair/typebox";

import { Nullable } from "../utils";

export const eventSlug = Type.String({
  description: "Event slug, used for accessing the event by URL.",
  minLength: 1,
  maxLength: 255,
  pattern: "^[A-Za-z0-9_-]+$",
});

/** Event ID type. Randomly generated alphanumeric string. */
export const eventID = Type.String({
  title: "EventID",
  description: "Event ID. Randomly generated alphanumeric string.",
  minLength: 1,
  maxLength: 32,
  pattern: "^[a-z0-9]+$",
});

/** Non-editable identity attributes for events. */
export const eventIdentity = Type.Object({
  id: eventID,
});

/** Event attributes that are included in public event lists. */
export const userEventListAttributes = Type.Object({
  title: Type.String({
    description: "Event title.",
    minLength: 1,
    maxLength: 255,
  }),
  slug: eventSlug,
  date: Nullable(Type.String({ format: "date-time" }), {
    description:
      "Event start date. Considered to be the start date if endDate is also set. If null, " +
      "the event is signup-only.",
  }),
  endDate: Nullable(Type.String({ format: "date-time" }), {
    description: "Event end date. If null, the event will not appear in iCalendar exports.",
  }),
  registrationStartDate: Nullable(Type.String({ format: "date-time" }), {
    description: "Event signup opening date. If null, the event does not have a signup.",
  }),
  registrationEndDate: Nullable(Type.String({ format: "date-time" }), {
    description: "Event signup closing date.",
  }),
  openQuotaSize: Type.Integer({
    description: "The size of the open quota, which will be filled with signups overflowing their dedicated quota.",
    minimum: 0,
  }),
  category: Type.String({
    description: "Category tag for the event. Can be used for filtering.",
    maxLength: 255,
  }),
  description: Nullable(Type.String(), {
    description: "Description for the event. Supports Markdown.",
  }),
  price: Nullable(Type.String({ maxLength: 255 }), {
    description: "Free-form pricing information for the event.",
  }),
  location: Nullable(Type.String({ maxLength: 255 }), {
    description: "Free-form location information for the event.",
  }),
  webpageUrl: Nullable(Type.String({ maxLength: 255 }), {
    description: "Link to an external event webpage.",
  }),
  facebookUrl: Nullable(Type.String({ maxLength: 255 }), {
    description: "Link to a Facebook page for the event.",
  }),
  signupsPublic: Type.Boolean({
    description: "Whether signups should be shown to all users.",
  }),
});

const attributesAddedForUsersInDetails = Type.Object({
  nameQuestion: Type.Boolean({
    description: "Whether signups should contain a name field.",
  }),
  emailQuestion: Type.Boolean({
    description: "Whether signups should contain an email field. Also enables confirmation emails.",
  }),
});

/** Event attributes that are included in public event details. */
export const userEventDetailsAttributes = Type.Composite([userEventListAttributes, attributesAddedForUsersInDetails]);

const attributesAddedForAdmins = Type.Object({
  draft: Type.Boolean({
    description: "Whether the event is a draft, shown only to signed-in admins.",
  }),
  listed: Type.Boolean({
    description:
      "Whether the event is publicly visible on the front page of Ilmomasiina." +
      " Unlisted events are only accessible with a direct link",
  }),
});

/** Event attributes that are included for admins in event lists. */
export const adminEventListAttributes = Type.Composite([userEventListAttributes, attributesAddedForAdmins]);

const attributesAddedForAdminsInDetails = Type.Object({
  verificationEmail: Nullable(Type.String(), {
    description: "Custom message for the signup confirmation email.",
  }),
});

/** Event attributes that are included for admins in event details. */
export const adminEventDetailsAttributes = Type.Composite([
  userEventListAttributes,
  attributesAddedForUsersInDetails,
  attributesAddedForAdmins,
  attributesAddedForAdminsInDetails,
]);

/** Event attributes that are dynamically calculated in public event details. */
export const eventDynamicAttributes = Type.Object({
  millisTillOpening: Nullable(Type.Integer(), {
    description: "Time in ms until signup opens. If null, the signup will not open in the future.",
  }),
  registrationClosed: Type.Boolean({
    description: "Whether the signup has closed.",
  }),
});
