CREATE TYPE "public"."question_type" AS ENUM('text', 'textarea', 'number', 'select', 'checkbox');--> statement-breakpoint
CREATE TYPE "public"."signup_status" AS ENUM('in-quota', 'in-open', 'in-queue');--> statement-breakpoint
CREATE TABLE "answer" (
	"id" serial PRIMARY KEY NOT NULL,
	"questionId" char(12) NOT NULL,
	"signupId" char(12) NOT NULL,
	"answer" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
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
--> statement-breakpoint
CREATE TABLE "event" (
	"id" char(12) PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
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
	"deletedAt" timestamp,
	CONSTRAINT "event_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "question" (
	"id" char(12) PRIMARY KEY NOT NULL,
	"eventId" char(12) NOT NULL,
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
--> statement-breakpoint
CREATE TABLE "quota" (
	"id" char(12) PRIMARY KEY NOT NULL,
	"eventId" char(12) NOT NULL,
	"order" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"size" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "signup" (
	"id" char(12) PRIMARY KEY NOT NULL,
	"quotaId" char(12) NOT NULL,
	"firstName" varchar(255),
	"lastName" varchar(255),
	"namePublic" boolean DEFAULT false,
	"email" varchar(255),
	"language" varchar(8),
	"confirmedAt" timestamp (3),
	"status" "signup_status",
	"position" integer,
	"createdAt" timestamp (3) DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	"deletedAt" timestamp
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"updatedAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_questionId_question_id_fk" FOREIGN KEY ("questionId") REFERENCES "public"."question"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "answer" ADD CONSTRAINT "answer_signupId_signup_id_fk" FOREIGN KEY ("signupId") REFERENCES "public"."signup"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "question" ADD CONSTRAINT "question_eventId_event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quota" ADD CONSTRAINT "quota_eventId_event_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."event"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "signup" ADD CONSTRAINT "signup_quotaId_quota_id_fk" FOREIGN KEY ("quotaId") REFERENCES "public"."quota"("id") ON DELETE cascade ON UPDATE no action;