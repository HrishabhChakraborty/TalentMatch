import { IsOptional, IsString } from 'class-validator';

export class UpdateRecruiterProfileDto {
  @IsString()
  companyName: string;

  @IsString()
  jobTitle: string;

  @IsOptional()
  @IsString()
  companySize?: string;

  @IsOptional()
  @IsString()
  industriesHiringFor?: string;
}
