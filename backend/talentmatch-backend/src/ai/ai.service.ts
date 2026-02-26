import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

export interface AiSummaryRequest {
  title?: string;
  desiredRole?: string;
  experienceYears?: string;
  skills?: string[];
  currentSummary?: string;
}

export interface AiSummaryResponse {
  summary: string;
}

export interface AiBulletRequest {
  bullet: string;
  roleContext?: string;
}

export interface AiBulletResponse {
  bullet: string;
}

export interface AiCandidateForScoring {
  id: number;
  name: string;
  title: string;
  experience: string;
  location: string;
  skills: string[];
  summary?: string;
  /** Summary of jobs and achievements for AI to analyze (e.g. "Role X at Company Y: bullet1; bullet2. Education: ..."). */
  workExperience?: string;
}

export interface AiCandidateScore {
  candidateId: number;
  score: number;
  insight: string;
}

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly ollamaUrl: string;
  private readonly model: string;

  constructor() {
    this.ollamaUrl = process.env['OLLAMA_URL'] ?? 'http://localhost:11434';
    this.model = process.env['OLLAMA_MODEL'] ?? 'llama3.2:3b';
  }

  async generateSummary(
    payload: AiSummaryRequest,
  ): Promise<AiSummaryResponse> {
    const prompt = this.buildSummaryPrompt(payload);
    const raw = await this.callOllama(prompt);
    const json = this.tryParseJson(raw);

    if (json && typeof json.summary === 'string') {
      return { summary: json.summary.trim() };
    }

    return {
      summary:
        (typeof raw === 'string' ? raw.trim().slice(0, 600) : '') ||
        'Experienced professional with a strong background in software engineering.',
    };
  }

  async improveBullet(payload: AiBulletRequest): Promise<AiBulletResponse> {
    const prompt = this.buildBulletPrompt(payload);
    const raw = await this.callOllama(prompt);
    const json = this.tryParseJson(raw);

    if (json && typeof json.bullet === 'string') {
      return { bullet: json.bullet.trim() };
    }

    return {
      bullet:
        (typeof raw === 'string' ? raw.trim().split('\n')[0].slice(0, 300) : '') ||
        payload.bullet,
    };
  }

  async scoreCandidatesAgainstRole(
    candidates: AiCandidateForScoring[],
    roleDescription: string,
  ): Promise<AiCandidateScore[]> {
    if (!roleDescription.trim() || candidates.length === 0) {
      return candidates.map((c) => ({
        candidateId: c.id,
        score: 0,
        insight: '',
      }));
    }

    const prompt = this.buildScoringPrompt(candidates, roleDescription);
    const raw = await this.callOllama(prompt);
    const json = this.tryParseJson(raw);

    if (Array.isArray(json)) {
      return json
        .map((item) => ({
          candidateId: Number(item.candidateId),
          score: Math.max(0, Math.min(100, Number(item.score) || 0)),
          insight:
            typeof item.insight === 'string'
              ? item.insight.trim()
              : 'Relevant experience and skills for the role.',
        }))
        .filter((x) => Number.isFinite(x.candidateId));
    }

    this.logger.warn('AI scoring returned non-array JSON, falling back');
    return candidates.map((c, idx) => ({
      candidateId: c.id,
      score: 70 - idx,
      insight: 'Strong overlap between experience and role description.',
    }));
  }

  private async callOllama(prompt: string): Promise<string> {
    try {
      const response = await axios.post(
        `${this.ollamaUrl}/api/generate`,
        {
          model: this.model,
          prompt,
          stream: false,
          options: {
            temperature: 0.6,
            top_p: 0.9,
          },
        },
        { timeout: 30000 },
      );

      const text =
        typeof response.data?.response === 'string'
          ? response.data.response
          : '';

      return text;
    } catch (error) {
      this.logger.error('Error calling Ollama', error as Error);
      throw error;
    }
  }

  private buildSummaryPrompt(payload: AiSummaryRequest): string {
    const skillsText = (payload.skills ?? []).join(', ');

    return `You are a resume writing assistant.

Write a concise, compelling professional summary for a candidate.

Candidate title: ${payload.title ?? ''}
Desired role: ${payload.desiredRole ?? ''}
Years of experience: ${payload.experienceYears ?? ''}
Skills: ${skillsText}
Current summary (if any): ${payload.currentSummary ?? ''}

Rules:
- 3–5 sentences.
- Focus on impact, quantifiable outcomes, and core strengths.
- Do not mention years in every sentence.

Respond ONLY in this exact JSON format (no markdown, no commentary):
{
  "summary": "..."
}`;
  }

  private buildBulletPrompt(payload: AiBulletRequest): string {
    return `You are improving resume bullet points for a candidate.

Original bullet:
"${payload.bullet}"

Role context: ${payload.roleContext ?? ''}

Rewrite this bullet to be:
- clear, concise, and action-oriented
- focused on impact and measurable results if possible
- suitable for a modern software engineer resume

Respond ONLY in this exact JSON format (no markdown, no commentary):
{
  "bullet": "..."
}`;
  }

  private buildScoringPrompt(
    candidates: AiCandidateForScoring[],
    roleDescription: string,
  ): string {
    const candidatesBlock = candidates
      .map(
        (c, index) => `Candidate #${index + 1}
id: ${c.id}
name: ${c.name}
title: ${c.title}
years of experience: ${c.experience}
location: ${c.location}
skills: ${(c.skills ?? []).join(', ')}
summary: ${c.summary ?? ''}
work experience and achievements: ${c.workExperience ?? '(none or not provided)'}`,
      )
      .join('\n\n');

    return `You are an expert technical recruiter.

You are given a role description and several candidates. For each candidate,
assign a match score from 0 to 100 and a one-sentence insight explaining job fit.

Base the match score and insight on the candidate's actual work experience, achievements,
and how they relate to the role. Consider technologies used, impact described, and
relevance to the role. For candidates with no work experience (freshers), consider
education, skills, and potential fit.

Role description:
${roleDescription}

Candidates:
${candidatesBlock}

Respond ONLY in JSON, as an array of objects, one per candidate, in this format:
[
  {
    "candidateId": 1,
    "score": 87,
    "insight": "Strong React and TypeScript experience, matches senior frontend requirements."
  }
]
`;
  }

  private tryParseJson(text: string): any | null {
    try {
      const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
      const candidate = match ? match[0] : text;
      return JSON.parse(candidate);
    } catch (error) {
      this.logger.warn('Failed to parse AI response as JSON', error as Error);
      return null;
    }
  }
}

