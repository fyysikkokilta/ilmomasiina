import { relations } from 'drizzle-orm';
import {
  boolean,
  char,
  integer,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// Enums
export const signupStatusEnum = pgEnum('signup_status', ['in-quota', 'in-open', 'in-queue']);
export const questionTypeEnum = pgEnum('question_type', ['text', 'textarea', 'number', 'select', 'checkbox']);

// Tables
export const user = pgTable('user', {
  id: serial('id').primaryKey(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

export const event = pgTable('event', {
  id: char('id', { length: 12 }).primaryKey(),
  title: varchar('title', { length: 255 }).notNull(),
  slug: varchar('slug', { length: 255 }).notNull().unique(),
  date: timestamp('date', { mode: 'date' }),
  endDate: timestamp('endDate', { mode: 'date' }),
  registrationStartDate: timestamp('registrationStartDate', { mode: 'date' }),
  registrationEndDate: timestamp('registrationEndDate', { mode: 'date' }),
  openQuotaSize: integer('openQuotaSize').notNull().default(0),
  description: text('description'),
  price: varchar('price', { length: 255 }),
  location: varchar('location', { length: 255 }),
  facebookUrl: varchar('facebookUrl', { length: 255 }),
  webpageUrl: varchar('webpageUrl', { length: 255 }),
  category: varchar('category', { length: 255 }).notNull().default(''),
  draft: boolean('draft').notNull().default(true),
  listed: boolean('listed').notNull().default(true),
  signupsPublic: boolean('signupsPublic').notNull().default(false),
  nameQuestion: boolean('nameQuestion').notNull().default(true),
  emailQuestion: boolean('emailQuestion').notNull().default(true),
  verificationEmail: text('verificationEmail'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date' }),
});

export const quota = pgTable('quota', {
  id: char('id', { length: 12 }).primaryKey(),
  eventId: char('eventId', { length: 12 }).notNull().references(() => event.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  size: integer('size'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date' }),
});

export const signup = pgTable('signup', {
  id: char('id', { length: 12 }).primaryKey(),
  quotaId: char('quotaId', { length: 12 }).notNull().references(() => quota.id, { onDelete: 'cascade' }),
  firstName: varchar('firstName', { length: 255 }),
  lastName: varchar('lastName', { length: 255 }),
  namePublic: boolean('namePublic').default(false),
  email: varchar('email', { length: 255 }),
  language: varchar('language', { length: 8 }),
  confirmedAt: timestamp('confirmedAt', { mode: 'date', precision: 3 }),
  status: signupStatusEnum('status'),
  position: integer('position'),
  createdAt: timestamp('createdAt', { mode: 'date', precision: 3 }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date' }),
});

export const question = pgTable('question', {
  id: char('id', { length: 12 }).primaryKey(),
  eventId: char('eventId', { length: 12 }).notNull().references(() => event.id, { onDelete: 'cascade' }),
  order: integer('order').notNull(),
  question: varchar('question', { length: 255 }).notNull(),
  type: questionTypeEnum('type').notNull(),
  options: varchar('options', { length: 255 }),
  required: boolean('required').notNull().default(true),
  public: boolean('public').notNull().default(false),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date' }),
});

export const answer = pgTable('answer', {
  id: serial('id').primaryKey(),
  questionId: char('questionId', { length: 12 }).notNull().references(() => question.id, { onDelete: 'cascade' }),
  signupId: char('signupId', { length: 12 }).notNull().references(() => signup.id, { onDelete: 'cascade' }),
  answer: varchar('answer', { length: 255 }).notNull(),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
  deletedAt: timestamp('deletedAt', { mode: 'date' }),
});

export const auditLog = pgTable('auditlog', {
  id: serial('id').primaryKey(),
  user: varchar('user', { length: 255 }),
  ipAddress: varchar('ipAddress', { length: 64 }).notNull(),
  action: varchar('action', { length: 32 }).notNull(),
  eventId: char('eventId', { length: 12 }),
  eventName: varchar('eventName', { length: 255 }),
  signupId: char('signupId', { length: 12 }),
  signupName: varchar('signupName', { length: 255 }),
  extra: text('extra'),
  createdAt: timestamp('createdAt', { mode: 'date' }).notNull().defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).notNull().defaultNow(),
});

// Relations will be in a separate file