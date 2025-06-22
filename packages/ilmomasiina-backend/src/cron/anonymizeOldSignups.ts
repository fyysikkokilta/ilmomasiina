import debug from "debug";
import moment from "moment";
import { and, eq, lt, ne, or, isNull, isNotNull, inArray } from "drizzle-orm";

import config from "../config";
import { db, answer, event, quota, signup } from "../models";

const redactedName = "Deleted";
const redactedEmail = "deleted@gdpr.invalid";
const redactedAnswer = "Deleted";

const debugLog = debug("app:cron:anonymize");

export default async function anonymizeOldSignups() {
  const redactOlderThan = moment().subtract(config.anonymizeAfterDays, "days").toDate();

  const signups = await db
    .select({
      id: signup.id,
    } as any)
    .from(signup as any)
    .leftJoin(quota as any, eq(signup.quotaId, quota.id) as any)
    .leftJoin(event as any, eq(quota.eventId, event.id) as any)
    .where(
      and(
        // Only anonymize if name and email aren't anonymized already
        or(
          ne(signup.firstName, redactedName),
          ne(signup.lastName, redactedName),
          ne(signup.email, redactedEmail)
        ),
        // Only anonymize if the event was long enough ago
        or(
          lt(event.date, redactOlderThan),
          // Or the event has no date and the signup closed long enough ago
          and(
            isNull(event.date),
            lt(event.registrationEndDate, redactOlderThan)
          )
        ),
        // Don't touch unconfirmed signups
        isNotNull(signup.confirmedAt)
      ) as any
    ) as any;

  if (signups.length === 0) {
    debugLog("No old signups to redact");
    return;
  }

  const ids = signups.map((signup: any) => signup.id);

  console.info(`Redacting older signups: ${ids.join(", ")}`);
  try {
    await db
      .update(signup as any)
      .set({
        firstName: redactedName,
        lastName: redactedName,
        email: redactedEmail,
      })
      .where(inArray(signup.id, ids) as any);

    await db
      .update(answer as any)
      .set({
        answer: redactedAnswer,
      })
      .where(inArray(answer.signupId, ids) as any);

    debugLog("Signups anonymized");
  } catch (error) {
    console.error(error);
  }
}
