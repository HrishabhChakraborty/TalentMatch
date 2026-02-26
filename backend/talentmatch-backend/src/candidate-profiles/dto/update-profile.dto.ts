import { IsOptional, IsString, IsBoolean } from 'class-validator';

export class UpdateCandidateProfileDto {
  @IsOptional()
  @IsString()
  visibility?: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  professionalEmail?: string;

  @IsOptional()
  @IsString()
  contactNumber?: string;

  @IsOptional()
  @IsString()
  githubUrl?: string;

  @IsOptional()
  @IsString()
  linkedinUrl?: string;

  @IsOptional()
  @IsString()
  summary?: string;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsString()
  desiredRole?: string;

  @IsOptional()
  @IsString()
  experienceYears?: string;

  // JSON-encoded arrays/objects, to be parsed on the frontend

  @IsOptional()
  @IsString()
  experienceJson?: string;

  @IsOptional()
  @IsString()
  educationJson?: string;

  @IsOptional()
  @IsString()
  skillsJson?: string;

  @IsOptional()
  @IsString()
  projectsJson?: string;

  @IsOptional()
  @IsString()
  certificationsJson?: string;

  @IsOptional()
  @IsBoolean()
  profileCompletedAt?: boolean;
}

