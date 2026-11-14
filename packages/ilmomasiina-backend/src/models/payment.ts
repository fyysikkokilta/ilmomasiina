import { paymentTable } from "../db/schema";

export { ACTIVE_PAYMENT_STATUSES } from "../db/relations";

export type Payment = typeof paymentTable.$inferSelect;
export type PaymentInsert = typeof paymentTable.$inferInsert;
