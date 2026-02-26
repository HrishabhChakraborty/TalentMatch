import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import { CandidatesService } from './candidates.service';
import { SearchDto } from './dto/search.dto';
import { CompareDto } from './dto/compare.dto';
import { InsightDto } from './dto/insight.dto';

@Controller('candidates')
export class CandidatesController {
  constructor(private readonly candidatesService: CandidatesService) {}

  @Get('search')
  @UseGuards(JwtAuthGuard)
  searchGet(
    @Query('q') q: string | undefined,
    @Query('experienceLevel') experienceLevel?: string,
    @Query('location') location?: string,
  ) {
    return this.candidatesService.search(
      q?.trim() ?? '',
      experienceLevel,
      location,
    );
  }

  @Post('search')
  @UseGuards(JwtAuthGuard)
  searchPost(@Body() body: SearchDto) {
    const roleDescription = body.roleDescription?.trim() ?? '';
    return this.candidatesService.search(
      roleDescription,
      body.experienceLevel,
      body.location,
    );
  }

  @Post('compare')
  @UseGuards(JwtAuthGuard)
  compare(@Body() body: CompareDto) {
    return this.candidatesService.compareCandidates(
      body.roleDescription ?? '',
      body.candidateIds ?? [],
    );
  }

  @Post('insight')
  @UseGuards(JwtAuthGuard)
  insight(@Body() body: InsightDto) {
    return this.candidatesService.getInsightForCandidate(
      body.candidateId,
      body.roleDescription,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  getPublicCandidateById(@Param('id', ParseIntPipe) id: number) {
    return this.candidatesService.getPublicCandidateById(id);
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  list() {
    return this.candidatesService.findAll();
  }
}
