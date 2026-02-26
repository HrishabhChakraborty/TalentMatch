import { Type } from 'class-transformer';
import {
  ArrayNotEmpty,
  IsArray,
  IsInt,
  IsString,
} from 'class-validator';

export class CompareDto {
  @IsString()
  roleDescription: string;

  @IsArray()
  @ArrayNotEmpty()
  @Type(() => Number)
  @IsInt({ each: true })
  candidateIds: number[];
}

