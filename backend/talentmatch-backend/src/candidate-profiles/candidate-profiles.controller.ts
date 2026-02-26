import { Body, Controller, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import type { RequestUser } from '../auth/types';
import { CandidateProfilesService } from './candidate-profiles.service';
import { UpdateCandidateProfileDto } from './dto/update-profile.dto';

@Controller('me/profile')
@UseGuards(JwtAuthGuard)
export class CandidateProfilesController {
  constructor(
    private readonly candidateProfilesService: CandidateProfilesService,
  ) {}

  @Get()
  getProfile(@Req() req: { user: RequestUser }) {
    const userId = req.user.id;
    return this.candidateProfilesService.getOrCreateForUser(userId);
  }

  @Patch()
  updateProfile(
    @Req() req: { user: RequestUser },
    @Body() dto: UpdateCandidateProfileDto,
  ) {
    const userId = req.user.id;
    return this.candidateProfilesService.updateProfile(userId, {
      visibility: dto.visibility,
      title: dto.title,
      professionalEmail: dto.professionalEmail,
      contactNumber: dto.contactNumber,
      githubUrl: dto.githubUrl,
      linkedinUrl: dto.linkedinUrl,
      summary: dto.summary,
      location: dto.location,
      desiredRole: dto.desiredRole,
      experienceYears: dto.experienceYears,
      experienceJson: dto.experienceJson,
      educationJson: dto.educationJson,
      skillsJson: dto.skillsJson,
      projectsJson: dto.projectsJson,
      certificationsJson: dto.certificationsJson,
      profileCompletedAt: dto.profileCompletedAt,
    });
  }

}

