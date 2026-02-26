import { IsInt, IsOptional, IsString } from 'class-validator';

export class InsightDto {
  @IsInt()
  candidateId: number;

  @IsOptional()
  @IsString()
  roleDescription?: string;
}
