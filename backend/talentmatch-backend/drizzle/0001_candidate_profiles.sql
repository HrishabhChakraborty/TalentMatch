CREATE TABLE "candidate_profiles" (
\t"id" serial PRIMARY KEY NOT NULL,
\t"user_id" integer NOT NULL,
\t"visibility" varchar(20) DEFAULT 'PRIVATE' NOT NULL,
\t"title" varchar(255),
\t"summary" text,
\t"location" varchar(255),
\t"desired_role" varchar(255),
\t"experience_years" varchar(50),
\t"experience_json" text DEFAULT '[]' NOT NULL,
\t"education_json" text DEFAULT '[]' NOT NULL,
\t"skills_json" text DEFAULT '[]' NOT NULL,
\t"projects_json" text,
\t"certifications_json" text,
\t"active_template_id" varchar(100),
\t"canvas_state" text,
\t"export_settings" text,
\tCONSTRAINT "candidate_profiles_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE,
\tCONSTRAINT "candidate_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint

