import moment from "moment";
import { lt, isNotNull, and } from "drizzle-orm";

import config from "../config";
import { db, answer, event, question, quota, signup } from "../models";

export default async function removeDeletedData() {
  const ifRemovedBefore = moment().subtract(config.deletionGracePeriod, "days").toDate();

  await db
    .delete(event as any)
    .where(
      and(
        isNotNull(event.deletedAt),
        lt(event.deletedAt, ifRemovedBefore)
      ) as any
    );

  await db
    .delete(question as any)
    .where(
      and(
        isNotNull(question.deletedAt),
        lt(question.deletedAt, ifRemovedBefore)
      ) as any
    );

  await db
    .delete(quota as any)
    .where(
      and(
        isNotNull(quota.deletedAt),
        lt(quota.deletedAt, ifRemovedBefore)
      ) as any
    );

  await db
    .delete(signup as any)
    .where(
      and(
        isNotNull(signup.deletedAt),
        lt(signup.deletedAt, ifRemovedBefore)
      ) as any
    );

  // Technically shouldn't be necessary due to how ON DELETE CASCADE works,
  // but here for completeness' sake.
  await db
    .delete(answer as any)
    .where(
      and(
        isNotNull(answer.deletedAt),
        lt(answer.deletedAt, ifRemovedBefore)
      ) as any
    );
}
