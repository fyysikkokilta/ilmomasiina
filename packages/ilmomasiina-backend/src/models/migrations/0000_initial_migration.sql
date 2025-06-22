-- Create enums
CREATE TYPE "signup_status" AS ENUM ('in-quota', 'in-open', 'in-queue');
CREATE TYPE "question_type" AS ENUM ('text', 'textarea', 'number', 'select', 'checkbox');

-- Create tables
CREATE TABLE "user" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar(255) NOT NULL UNIQUE,
  "password" varchar(255) NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "event" (
  "id" char(12) PRIMARY KEY NOT NULL,
  "title" varchar(255) NOT NULL,
  "slug" varchar(255) NOT NULL UNIQUE,
  "date" timestamp,
  "endDate" timestamp,
  "registrationStartDate" timestamp,
  "registrationEndDate" timestamp,
  "openQuotaSize" integer DEFAULT 0 NOT NULL,
  "description" text,
  "price" varchar(255),
  "location" varchar(255),
  "facebookUrl" varchar(255),
  "webpageUrl" varchar(255),
  "category" varchar(255) DEFAULT '' NOT NULL,
  "draft" boolean DEFAULT true NOT NULL,
  "listed" boolean DEFAULT true NOT NULL,
  "signupsPublic" boolean DEFAULT false NOT NULL,
  "nameQuestion" boolean DEFAULT true NOT NULL,
  "emailQuestion" boolean DEFAULT true NOT NULL,
  "verificationEmail" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "deletedAt" timestamp
);

CREATE TABLE "quota" (
  "id" char(12) PRIMARY KEY NOT NULL,
  "eventId" char(12) NOT NULL REFERENCES "event"("id") ON DELETE CASCADE,
  "order" integer NOT NULL,
  "title" varchar(255) NOT NULL,
  "size" integer,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "deletedAt" timestamp
);

CREATE TABLE "signup" (
  "id" char(12) PRIMARY KEY NOT NULL,
  "quotaId" char(12) NOT NULL REFERENCES "quota"("id") ON DELETE CASCADE,
  "firstName" varchar(255),
  "lastName" varchar(255),
  "namePublic" boolean DEFAULT false,
  "email" varchar(255),
  "language" varchar(8),
  "confirmedAt" timestamp(3),
  "status" "signup_status",
  "position" integer,
  "createdAt" timestamp(3) DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "deletedAt" timestamp
);

CREATE TABLE "question" (
  "id" char(12) PRIMARY KEY NOT NULL,
  "eventId" char(12) NOT NULL REFERENCES "event"("id") ON DELETE CASCADE,
  "order" integer NOT NULL,
  "question" varchar(255) NOT NULL,
  "type" "question_type" NOT NULL,
  "options" varchar(255),
  "required" boolean DEFAULT true NOT NULL,
  "public" boolean DEFAULT false NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "deletedAt" timestamp
);

CREATE TABLE "answer" (
  "id" serial PRIMARY KEY NOT NULL,
  "questionId" char(12) NOT NULL REFERENCES "question"("id") ON DELETE CASCADE,
  "signupId" char(12) NOT NULL REFERENCES "signup"("id") ON DELETE CASCADE,
  "answer" varchar(255) NOT NULL,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL,
  "deletedAt" timestamp
);

CREATE TABLE "auditlog" (
  "id" serial PRIMARY KEY NOT NULL,
  "user" varchar(255),
  "ipAddress" varchar(64) NOT NULL,
  "action" varchar(32) NOT NULL,
  "eventId" char(12),
  "eventName" varchar(255),
  "signupId" char(12),
  "signupName" varchar(255),
  "extra" text,
  "createdAt" timestamp DEFAULT now() NOT NULL,
  "updatedAt" timestamp DEFAULT now() NOT NULL
);

-- Create indexes (from migration 0005-add-indexes.ts)
CREATE INDEX "idx_signup_quotaId" ON "signup" ("quotaId");
CREATE INDEX "idx_signup_status" ON "signup" ("status");
CREATE INDEX "idx_signup_position" ON "signup" ("position");
CREATE INDEX "idx_signup_confirmed" ON "signup" ("confirmedAt");
CREATE INDEX "idx_signup_createdAt" ON "signup" ("createdAt");
CREATE INDEX "idx_signup_deletedAt" ON "signup" ("deletedAt");
CREATE INDEX "idx_answer_signupId" ON "answer" ("signupId");
CREATE INDEX "idx_answer_questionId" ON "answer" ("questionId");
CREATE INDEX "idx_auditlog_action" ON "auditlog" ("action");
CREATE INDEX "idx_auditlog_eventId" ON "auditlog" ("eventId");
CREATE INDEX "idx_auditlog_signupId" ON "auditlog" ("signupId");
CREATE INDEX "idx_auditlog_createdAt" ON "auditlog" ("createdAt");