import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CandidatesModule } from './candidates/candidates.module';
import { CandidateProfilesModule } from './candidate-profiles/candidate-profiles.module';
import { AiModule } from './ai/ai.module';
import { RecruiterProfilesModule } from './recruiter-profiles/recruiter-profiles.module';

@Module({
  imports: [
    DatabaseModule,
    AuthModule,
    UsersModule,
    CandidatesModule,
    AiModule,
    CandidateProfilesModule,
    RecruiterProfilesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}