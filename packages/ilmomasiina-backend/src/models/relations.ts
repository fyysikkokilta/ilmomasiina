import { relations } from 'drizzle-orm';
import { user, event, quota, signup, question, answer, auditLog } from './schema';

export const userRelations = relations(user, ({ many }) => ({
  // Users don't have direct relations in the original schema
}));

export const eventRelations = relations(event, ({ many }) => ({
  questions: many(question),
  quotas: many(quota),
}));

export const quotaRelations = relations(quota, ({ one, many }) => ({
  event: one(event, {
    fields: [quota.eventId],
    references: [event.id],
  }),
  signups: many(signup),
}));

export const signupRelations = relations(signup, ({ one, many }) => ({
  quota: one(quota, {
    fields: [signup.quotaId],
    references: [quota.id],
  }),
  answers: many(answer),
}));

export const questionRelations = relations(question, ({ one, many }) => ({
  event: one(event, {
    fields: [question.eventId],
    references: [event.id],
  }),
  answers: many(answer),
}));

export const answerRelations = relations(answer, ({ one }) => ({
  question: one(question, {
    fields: [answer.questionId],
    references: [question.id],
  }),
  signup: one(signup, {
    fields: [answer.signupId],
    references: [signup.id],
  }),
}));

export const auditLogRelations = relations(auditLog, ({ one }) => ({
  // Audit logs have soft references but no actual foreign keys
}));