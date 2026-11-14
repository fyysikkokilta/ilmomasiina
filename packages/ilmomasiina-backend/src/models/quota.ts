import { quotaTable } from "../db/schema";

export type Quota = typeof quotaTable.$inferSelect;
export type QuotaInsert = typeof quotaTable.$inferInsert;
