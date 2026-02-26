import { IsOptional, IsString } from 'class-validator';

export class SearchDto {
  @IsOptional()
  @IsString()
  roleDescription?: string;

  @IsOptional()
  @IsString()
  experienceLevel?: string;

  @IsOptional()
  @IsString()
  location?: string;
}
