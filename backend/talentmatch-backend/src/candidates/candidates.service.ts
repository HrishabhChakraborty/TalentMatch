import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, eq, ilike, inArray, isNotNull, or, type SQL } from 'drizzle-orm';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { DRIZZLE } from '../database/database.module';
import { candidateProfiles, users } from '../database/schema';
import { AiService, type AiCandidateForScoring } from '../ai/ai.service';

export interface CandidateResult {
  id: number;
  name: string;
  title: string;
  experience: string;
  location: string;
  matchScore: number;
  skills: string[];
  aiInsight: string;
  highlights: string[];
}

export interface CandidateFullProfile {
  id: number;
  name: string;
  email: string;
  title: string;
  summary: string;
  location: string;
  experienceYears: string;
  desiredRole: string;
  professionalEmail: string;
  contactNumber: string;
  githubUrl: string;
  linkedinUrl: string;
  experienceJson: string;
  educationJson: string;
  skillsJson: string;
  projectsJson: string;
  certificationsJson: string;
}

function parseJsonArray(raw: string): string[] {
  try {
    const arr = JSON.parse(raw) as unknown;
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function extractHighlights(experienceJson: string): string[] {
  try {
    const exp = JSON.parse(experienceJson) as Array<{ bullets?: string[] }>;
    const out: string[] = [];
    for (const e of exp) {
      if (Array.isArray(e.bullets)) out.push(...e.bullets.slice(0, 2));
    }
    return out.slice(0, 5);
  } catch {
    return [];
  }
}

function buildWorkExperienceSummary(
  experienceJson: string,
  educationJson?: string | null,
): string {
  const parts: string[] = [];
  try {
    const exp = JSON.parse(experienceJson || '[]') as Array<{
      title?: string;
      company?: string;
      startDate?: string;
      endDate?: string;
      bullets?: string[];
    }>;
    for (const job of exp) {
      if (!job.title && !job.company) continue;
      const role = [job.title, job.company].filter(Boolean).join(' at ');
      const dates = [job.startDate, job.endDate].filter(Boolean).join(' – ');
      let line = role;
      if (dates) line += ` (${dates})`;
      if (Array.isArray(job.bullets) && job.bullets.length > 0) {
        line += ': ' + job.bullets.join('; ');
      }
      parts.push(line);
    }
  } catch {
    // ignore
  }
  if (educationJson) {
    try {
      const edu = JSON.parse(educationJson) as Array<{
        school?: string;
        degree?: string;
        startDate?: string;
        endDate?: string;
      }>;
      const eduParts = edu
        .filter((e) => e.school || e.degree)
        .map((e) => {
          const s = [e.school, e.degree].filter(Boolean).join(', ');
          const d = [e.startDate, e.endDate].filter(Boolean).join(' – ');
          return d ? `${s} (${d})` : s;
        });
      if (eduParts.length) parts.push('Education: ' + eduParts.join('; '));
    } catch {
      // ignore
    }
  }
  return parts.join('. ') || '';
}

@Injectable()
export class CandidatesService {
  constructor(
    @Inject(DRIZZLE)
    private readonly db: NodePgDatabase<typeof import('../database/schema')>,
    private readonly aiService: AiService,
  ) {}

  async search(
    query: string,
    experienceLevel?: string,
    location?: string,
  ): Promise<CandidateResult[]> {
    const q = query.trim();
    const conditions: SQL[] = [
      eq(users.role, 'CANDIDATE'),
      eq(candidateProfiles.visibility, 'PUBLIC'),
      isNotNull(candidateProfiles.profileCompletedAt),
    ];

    if (q) {
      const words = q.split(/\s+/).filter(Boolean);
      if (words.length > 0) {
        conditions.push(
          or(
            ...words.map((word) =>
              ilike(candidateProfiles.resumeText, `%${word}%`),
            ),
          ) as SQL,
        );
      }
    }

    if (experienceLevel && experienceLevel !== 'Any') {
      conditions.push(
        ilike(candidateProfiles.experienceYears, `%${experienceLevel}%`) as SQL,
      );
    }

    const loc = location?.trim();
    if (loc) {
      conditions.push(ilike(candidateProfiles.location, `%${loc}%`) as SQL);
    }

    const rows = await this.db
      .select({
        id: candidateProfiles.id,
        name: users.name,
        title: candidateProfiles.title,
        experienceYears: candidateProfiles.experienceYears,
        location: candidateProfiles.location,
        skillsJson: candidateProfiles.skillsJson,
        experienceJson: candidateProfiles.experienceJson,
        resumeText: candidateProfiles.resumeText,
      })
      .from(candidateProfiles)
      .innerJoin(users, eq(candidateProfiles.userId, users.id))
      .where(and(...conditions))
      .limit(50);

    return rows.map((row) => ({
      id: row.id,
      name: row.name ?? '',
      title: row.title ?? '',
      experience: row.experienceYears ?? '',
      location: row.location ?? '',
      matchScore: 0,
      skills: parseJsonArray(row.skillsJson ?? '[]'),
      aiInsight: '',
      highlights: extractHighlights(row.experienceJson ?? '[]'),
    }));
  }

  async findAll(): Promise<CandidateResult[]> {
    const rows = await this.db
      .select({
        id: candidateProfiles.id,
        name: users.name,
        title: candidateProfiles.title,
        experienceYears: candidateProfiles.experienceYears,
        location: candidateProfiles.location,
        skillsJson: candidateProfiles.skillsJson,
        experienceJson: candidateProfiles.experienceJson,
      })
      .from(candidateProfiles)
      .innerJoin(users, eq(candidateProfiles.userId, users.id))
      .where(
        and(
          eq(users.role, 'CANDIDATE'),
          eq(candidateProfiles.visibility, 'PUBLIC'),
          isNotNull(candidateProfiles.profileCompletedAt),
        ),
      )
      .limit(100);

    return rows.map((row) => ({
      id: row.id,
      name: row.name ?? '',
      title: row.title ?? '',
      experience: row.experienceYears ?? '',
      location: row.location ?? '',
      matchScore: 0,
      skills: parseJsonArray(row.skillsJson ?? '[]'),
      aiInsight: '',
      highlights: extractHighlights(row.experienceJson ?? '[]'),
    }));
  }

  async compareCandidates(
    roleDescription: string,
    candidateIds: number[],
  ): Promise<CandidateResult[]> {
    const ids = candidateIds.filter((id) => Number.isFinite(id));
    if (!roleDescription.trim() || ids.length === 0) return [];

    const rows = await this.db
      .select({
        id: candidateProfiles.id,
        name: users.name,
        title: candidateProfiles.title,
        experienceYears: candidateProfiles.experienceYears,
        location: candidateProfiles.location,
        skillsJson: candidateProfiles.skillsJson,
        experienceJson: candidateProfiles.experienceJson,
        educationJson: candidateProfiles.educationJson,
        summary: candidateProfiles.summary,
      })
      .from(candidateProfiles)
      .innerJoin(users, eq(candidateProfiles.userId, users.id))
      .where(inArray(candidateProfiles.id, ids));

    const mapped: CandidateResult[] = rows.map((row) => ({
      id: row.id,
      name: row.name ?? '',
      title: row.title ?? '',
      experience: row.experienceYears ?? '',
      location: row.location ?? '',
      matchScore: 0,
      skills: parseJsonArray(row.skillsJson ?? '[]'),
      aiInsight: '',
      highlights: extractHighlights(row.experienceJson ?? '[]'),
    }));

    if (mapped.length === 0) return [];

    const aiInput: AiCandidateForScoring[] = rows.map((row) => ({
      id: row.id,
      name: row.name ?? '',
      title: row.title ?? '',
      experience: row.experienceYears ?? '',
      location: row.location ?? '',
      skills: parseJsonArray(row.skillsJson ?? '[]'),
      summary: row.summary ?? undefined,
      workExperience: buildWorkExperienceSummary(
        row.experienceJson ?? '[]',
        row.educationJson,
      ),
    }));

    try {
      const aiScores = await this.aiService.scoreCandidatesAgainstRole(
        aiInput,
        roleDescription,
      );
      const scoreById = new Map<number, { score: number; insight: string }>();
      for (const item of aiScores) {
        scoreById.set(item.candidateId, {
          score: item.score,
          insight: item.insight,
        });
      }
      const withScores = mapped.map((c) => {
        const ai = scoreById.get(c.id);
        if (!ai) return c;
        return { ...c, matchScore: ai.score, aiInsight: ai.insight };
      });
      return withScores.sort((a, b) => b.matchScore - a.matchScore);
    } catch {
      return mapped;
    }
  }

  async getInsightForCandidate(
    candidateId: number,
    roleDescription?: string,
  ): Promise<{ insight: string; matchScore: number }> {
    const rows = await this.db
      .select({
        id: candidateProfiles.id,
        name: users.name,
        title: candidateProfiles.title,
        experienceYears: candidateProfiles.experienceYears,
        location: candidateProfiles.location,
        skillsJson: candidateProfiles.skillsJson,
        experienceJson: candidateProfiles.experienceJson,
        educationJson: candidateProfiles.educationJson,
        summary: candidateProfiles.summary,
      })
      .from(candidateProfiles)
      .innerJoin(users, eq(candidateProfiles.userId, users.id))
      .where(eq(candidateProfiles.id, candidateId))
      .limit(1);

    const row = rows[0];
    if (!row) return { insight: '', matchScore: 0 };

    const mapped: CandidateResult = {
      id: row.id,
      name: row.name ?? '',
      title: row.title ?? '',
      experience: row.experienceYears ?? '',
      location: row.location ?? '',
      matchScore: 0,
      skills: parseJsonArray(row.skillsJson ?? '[]'),
      aiInsight: '',
      highlights: [],
    };

    const roleContext = (roleDescription ?? '').trim() || 'General technical role';
    const aiInput: AiCandidateForScoring[] = [
      {
        id: mapped.id,
        name: mapped.name,
        title: mapped.title,
        experience: mapped.experience,
        location: mapped.location,
        skills: mapped.skills,
        summary: row.summary ?? undefined,
        workExperience: buildWorkExperienceSummary(
          row.experienceJson ?? '[]',
          row.educationJson,
        ),
      },
    ];

    try {
      const aiScores = await this.aiService.scoreCandidatesAgainstRole(
        aiInput,
        roleContext,
      );
      const first = aiScores[0];
      if (first) {
        return {
          insight: first.insight,
          matchScore: Math.max(0, Math.min(100, first.score)),
        };
      }
    } catch {
      // fallback
    }
    return { insight: 'Unable to generate insight.', matchScore: 0 };
  }

  async getPublicCandidateById(id: number): Promise<CandidateFullProfile> {
    const rows = await this.db
      .select({
        id: candidateProfiles.id,
        name: users.name,
        email: users.email,
        title: candidateProfiles.title,
        summary: candidateProfiles.summary,
        location: candidateProfiles.location,
        experienceYears: candidateProfiles.experienceYears,
        desiredRole: candidateProfiles.desiredRole,
        professionalEmail: candidateProfiles.professionalEmail,
        contactNumber: candidateProfiles.contactNumber,
        githubUrl: candidateProfiles.githubUrl,
        linkedinUrl: candidateProfiles.linkedinUrl,
        experienceJson: candidateProfiles.experienceJson,
        educationJson: candidateProfiles.educationJson,
        skillsJson: candidateProfiles.skillsJson,
        projectsJson: candidateProfiles.projectsJson,
        certificationsJson: candidateProfiles.certificationsJson,
      })
      .from(candidateProfiles)
      .innerJoin(users, eq(candidateProfiles.userId, users.id))
      .where(
        and(
          eq(candidateProfiles.id, id),
          eq(users.role, 'CANDIDATE'),
          eq(candidateProfiles.visibility, 'PUBLIC'),
          isNotNull(candidateProfiles.profileCompletedAt),
        ),
      )
      .limit(1);

    const row = rows[0];
    if (!row) {
      throw new NotFoundException('Candidate profile not found');
    }

    return {
      id: row.id,
      name: row.name ?? '',
      email: row.email ?? '',
      title: row.title ?? '',
      summary: row.summary ?? '',
      location: row.location ?? '',
      experienceYears: row.experienceYears ?? '',
      desiredRole: row.desiredRole ?? '',
      professionalEmail: row.professionalEmail ?? '',
      contactNumber: row.contactNumber ?? '',
      githubUrl: row.githubUrl ?? '',
      linkedinUrl: row.linkedinUrl ?? '',
      experienceJson: row.experienceJson ?? '[]',
      educationJson: row.educationJson ?? '[]',
      skillsJson: row.skillsJson ?? '[]',
      projectsJson: row.projectsJson ?? '[]',
      certificationsJson: row.certificationsJson ?? '[]',
    };
  }
}
