import { Body, Controller, ForbiddenException, Get, Patch, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/auth.guard';
import type { RequestUser } from '../auth/types';
import { RecruiterProfilesService } from './recruiter-profiles.service';
import { UpdateRecruiterProfileDto } from './dto/update-recruiter-profile.dto';

@Controller('me/recruiter-profile')
@UseGuards(JwtAuthGuard)
export class RecruiterProfilesController {
  constructor(
    private readonly recruiterProfilesService: RecruiterProfilesService,
  ) {}

  private ensureRecruiter(user: RequestUser) {
    if (user.role?.toUpperCase() !== 'RECRUITER') {
      throw new ForbiddenException('Recruiter profile is only for recruiters');
    }
  }

  @Get()
  async getProfile(@Req() req: { user: RequestUser }) {
    this.ensureRecruiter(req.user);
    const userId = req.user.id;
    const profile = await this.recruiterProfilesService.findByUserId(userId);
    return profile;
  }

  @Patch()
  async updateProfile(
    @Req() req: { user: RequestUser },
    @Body() dto: UpdateRecruiterProfileDto,
  ) {
    this.ensureRecruiter(req.user);
    const userId = req.user.id;
    const existing = await this.recruiterProfilesService.findByUserId(userId);
    if (existing) {
      return this.recruiterProfilesService.update(userId, {
        companyName: dto.companyName,
        jobTitle: dto.jobTitle,
        companySize: dto.companySize,
        industriesHiringFor: dto.industriesHiringFor,
      });
    }
    return this.recruiterProfilesService.create(userId, {
      companyName: dto.companyName,
      jobTitle: dto.jobTitle,
      companySize: dto.companySize,
      industriesHiringFor: dto.industriesHiringFor,
    });
  }
}
