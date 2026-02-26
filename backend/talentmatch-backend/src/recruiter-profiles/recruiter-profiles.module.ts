import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RecruiterProfilesService } from './recruiter-profiles.service';
import { RecruiterProfilesController } from './recruiter-profiles.controller';

@Module({
  imports: [DatabaseModule],
  providers: [RecruiterProfilesService],
  controllers: [RecruiterProfilesController],
  exports: [RecruiterProfilesService],
})
export class RecruiterProfilesModule {}
