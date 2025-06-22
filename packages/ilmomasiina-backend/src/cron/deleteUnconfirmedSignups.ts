import debug from "debug";
import _ from "lodash";
import moment from "moment";
import { and, eq, lt, isNull, inArray } from "drizzle-orm";

import config from "../config";
import { db, event, quota, signup } from "../models";
import { refreshSignupPositions } from "../routes/signups/computeSignupPosition";

const debugLog = debug("app:cron:unconfirmed");

export default async function deleteUnconfirmedSignups() {
  const signups = await db
    .select({
      id: signup.id,
      quotaId: signup.quotaId,
      eventId: quota.eventId,
      openQuotaSize: event.openQuotaSize,
    } as any)
    .from(signup as any)
    .leftJoin(quota as any, eq(signup.quotaId, quota.id) as any)
    .leftJoin(event as any, eq(quota.eventId, event.id) as any)
    .where(
      and(
        isNull(signup.confirmedAt),
        lt(signup.createdAt, moment().subtract(config.signupConfirmMins, "minutes").toDate())
      ) as any
    ) as any;

  if (signups.length === 0) {
    debugLog("No unconfirmed signups to delete");
    return;
  }

  const signupIds = signups.map((signup: any) => signup.id);
  const uniqueEvents = _.uniqBy(
    signups.map((signup: any) => ({ id: signup.eventId, openQuotaSize: signup.openQuotaSize })),
    "id",
  );

  console.info(`Deleting unconfirmed signups: ${signupIds.join(", ")}`);
  try {
    await db
      .delete(signup as any)
      .where(inArray(signup.id, signupIds) as any);
      
    for (const eventData of uniqueEvents) {
      // Avoid doing many simultaneous transactions with this loop.
      // eslint-disable-next-line no-await-in-loop
      await refreshSignupPositions(eventData);
    }
    debugLog("Unconfirmed signups deleted");
  } catch (error) {
    console.error(error);
  }
}
