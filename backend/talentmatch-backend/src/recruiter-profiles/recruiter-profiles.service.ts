import { Inject, Injectable } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import {
  recruiterProfiles,
  type RecruiterProfile,
  type NewRecruiterProfile,
} from '../database/schema';

@Injectable()
export class RecruiterProfilesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof import('../database/schema')>,
  ) {}

  async findByUserId(userId: number): Promise<RecruiterProfile | null> {
    const rows = await this.db
      .select()
      .from(recruiterProfiles)
      .where(eq(recruiterProfiles.userId, userId))
      .limit(1);
    return rows[0] ?? null;
  }

  async create(
    userId: number,
    data: {
      companyName: string;
      jobTitle: string;
      companySize?: string | null;
      industriesHiringFor?: string | null;
    },
  ): Promise<RecruiterProfile> {
    const [profile] = await this.db
      .insert(recruiterProfiles)
      .values({
        userId,
        companyName: data.companyName,
        jobTitle: data.jobTitle,
        companySize: data.companySize ?? null,
        industriesHiringFor: data.industriesHiringFor ?? null,
      } satisfies Partial<NewRecruiterProfile>)
      .returning();
    return profile;
  }

  async update(
    userId: number,
    data: {
      companyName?: string;
      jobTitle?: string;
      companySize?: string | null;
      industriesHiringFor?: string | null;
    },
  ): Promise<RecruiterProfile> {
    const [updated] = await this.db
      .update(recruiterProfiles)
      .set(data)
      .where(eq(recruiterProfiles.userId, userId))
      .returning();
    if (!updated) throw new Error('Recruiter profile not found');
    return updated;
  }
}
