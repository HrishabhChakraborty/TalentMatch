-- Add profile completion and searchable resume text to candidate_profiles
ALTER TABLE "candidate_profiles" ADD COLUMN IF NOT EXISTS "profile_completed_at" timestamp;
ALTER TABLE "candidate_profiles" ADD COLUMN IF NOT EXISTS "resume_text" text;

--> statement-breakpoint

-- Recruiter profiles (one per user)
CREATE TABLE IF NOT EXISTS "recruiter_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"job_title" varchar(255) NOT NULL,
	"company_size" varchar(50),
	"industries_hiring_for" text,
	CONSTRAINT "recruiter_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
	CONSTRAINT "recruiter_profiles_user_id_unique" UNIQUE("user_id")
);

--> statement-breakpoint

-- Drop legacy demo candidates table; recruiter search now uses candidate_profiles + users
DROP TABLE IF EXISTS "candidates";
