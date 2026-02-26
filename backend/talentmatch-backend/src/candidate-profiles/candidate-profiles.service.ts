import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import {
  candidateProfiles,
  type CandidateProfile,
  type NewCandidateProfile,
} from '../database/schema';

@Injectable()
export class CandidateProfilesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof import('../database/schema')>,
  ) {}

  async findByUserId(userId: number): Promise<CandidateProfile | null> {
    const rows = await this.db
      .select()
      .from(candidateProfiles)
      .where(eq(candidateProfiles.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }

  async createForUser(userId: number): Promise<CandidateProfile> {
    const [profile] = await this.db
      .insert(candidateProfiles)
      .values({
        userId,
        visibility: 'PRIVATE',
        experienceJson: '[]',
        educationJson: '[]',
        skillsJson: '[]',
      } satisfies Partial<NewCandidateProfile>)
      .returning();

    return profile;
  }

  async getOrCreateForUser(userId: number): Promise<CandidateProfile> {
    const existing = await this.findByUserId(userId);
    if (existing) return existing;
    return this.createForUser(userId);
  }

  async updateProfile(
    userId: number,
    data: {
      visibility?: string;
      title?: string | null;
      professionalEmail?: string | null;
      contactNumber?: string | null;
      githubUrl?: string | null;
      linkedinUrl?: string | null;
      summary?: string | null;
      location?: string | null;
      desiredRole?: string | null;
      experienceYears?: string | null;
      experienceJson?: string;
      educationJson?: string;
      skillsJson?: string;
      projectsJson?: string | null;
      certificationsJson?: string | null;
      profileCompletedAt?: boolean;
    },
  ): Promise<CandidateProfile> {
    await this.getOrCreateForUser(userId);

    const { profileCompletedAt: completeFlag, ...rest } = data;
    const set: Partial<NewCandidateProfile> = { ...rest };
    if (completeFlag === true) {
      set.profileCompletedAt = new Date();
    }

    const [updated] = await this.db
      .update(candidateProfiles)
      .set(set)
      .where(eq(candidateProfiles.userId, userId))
      .returning();

    if (!updated) throw new Error('Profile not found');

    const resumeText = this.buildResumeText(updated);
    const [final] = await this.db
      .update(candidateProfiles)
      .set({ resumeText })
      .where(eq(candidateProfiles.userId, userId))
      .returning();

    return final ?? updated;
  }

  private buildResumeText(profile: CandidateProfile): string {
    const parts: string[] = [];
    if (profile.summary) parts.push(profile.summary);
    if (profile.title) parts.push(profile.title);
    if (profile.experienceYears) parts.push(profile.experienceYears);
    if (profile.location) parts.push(profile.location);
    if (profile.desiredRole) parts.push(profile.desiredRole);

    try {
      const exp = JSON.parse(profile.experienceJson ?? '[]') as Array<{ title?: string; company?: string; bullets?: string[] }>;
      for (const e of exp) {
        if (e.title) parts.push(e.title);
        if (e.company) parts.push(e.company);
        if (Array.isArray(e.bullets)) parts.push(e.bullets.join(' '));
      }
    } catch {
      // ignore
    }

    try {
      const skills = JSON.parse(profile.skillsJson ?? '[]') as string[];
      if (skills.length) parts.push(skills.join(' '));
    } catch {
      // ignore
    }

    try {
      const edu = JSON.parse(profile.educationJson ?? '[]') as Array<{ school?: string; degree?: string }>;
      for (const e of edu) {
        if (e.school) parts.push(e.school);
        if (e.degree) parts.push(e.degree);
      }
    } catch {
      // ignore
    }

    return parts.filter(Boolean).join(' ').slice(0, 10000) || '';
  }

}

