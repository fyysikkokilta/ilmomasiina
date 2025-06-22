import moment from "moment";
import { lt } from "drizzle-orm";

import config from "../config";
import { db, auditLog } from "../models";

export default async function deleteOldAuditLogs() {
  await db
    .delete(auditLog as any)
    .where(lt(auditLog.createdAt, moment().subtract(config.anonymizeAfterDays, "days").toDate()) as any);
}
