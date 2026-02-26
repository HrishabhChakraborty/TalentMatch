ALTER TABLE "candidate_profiles"
ADD COLUMN IF NOT EXISTS "professional_email" varchar(255),
ADD COLUMN IF NOT EXISTS "contact_number" varchar(50),
ADD COLUMN IF NOT EXISTS "github_url" varchar(255),
ADD COLUMN IF NOT EXISTS "linkedin_url" varchar(255);
