import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CandidateProfilesService } from './candidate-profiles.service';
import { CandidateProfilesController } from './candidate-profiles.controller';

@Module({
  imports: [DatabaseModule],
  providers: [CandidateProfilesService],
  controllers: [CandidateProfilesController],
  exports: [CandidateProfilesService],
})
export class CandidateProfilesModule {}

