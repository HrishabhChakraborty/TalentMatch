import { pgTable, serial, varchar, text, integer, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  role: varchar('role', { length: 20 }).notNull().default('CANDIDATE'),
});

export const candidateProfiles = pgTable('candidate_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  visibility: varchar('visibility', { length: 20 })
    .notNull()
    .default('PRIVATE'),
  title: varchar('title', { length: 255 }),
  professionalEmail: varchar('professional_email', { length: 255 }),
  contactNumber: varchar('contact_number', { length: 50 }),
  githubUrl: varchar('github_url', { length: 255 }),
  linkedinUrl: varchar('linkedin_url', { length: 255 }),
  summary: text('summary'),
  location: varchar('location', { length: 255 }),
  desiredRole: varchar('desired_role', { length: 255 }),
  experienceYears: varchar('experience_years', { length: 50 }),
  experienceJson: text('experience_json').notNull().default('[]'),
  educationJson: text('education_json').notNull().default('[]'),
  skillsJson: text('skills_json').notNull().default('[]'),
  projectsJson: text('projects_json'),
  certificationsJson: text('certifications_json'),
  profileCompletedAt: timestamp('profile_completed_at'),
  resumeText: text('resume_text'),
});

export const recruiterProfiles = pgTable('recruiter_profiles', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  companyName: varchar('company_name', { length: 255 }).notNull(),
  jobTitle: varchar('job_title', { length: 255 }).notNull(),
  companySize: varchar('company_size', { length: 50 }),
  industriesHiringFor: text('industries_hiring_for'),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type CandidateProfile = typeof candidateProfiles.$inferSelect;
export type NewCandidateProfile = typeof candidateProfiles.$inferInsert;
export type RecruiterProfile = typeof recruiterProfiles.$inferSelect;
export type NewRecruiterProfile = typeof recruiterProfiles.$inferInsert;
