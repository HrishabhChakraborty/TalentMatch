CREATE TABLE "candidates" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"title" varchar(255) NOT NULL,
	"experience" varchar(100) NOT NULL,
	"location" varchar(255) NOT NULL,
	"resume_text" text NOT NULL,
	"skills" text NOT NULL,
	"ai_insight" text,
	"highlights" text,
	"match_score" varchar(10) DEFAULT '0'
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role" varchar(20) DEFAULT 'CANDIDATE' NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
