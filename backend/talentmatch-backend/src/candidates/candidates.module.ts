import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AiModule } from '../ai/ai.module';
import { CandidatesController } from './candidates.controller';
import { CandidatesService } from './candidates.service';

@Module({
  imports: [DatabaseModule, AiModule],
  controllers: [CandidatesController],
  providers: [CandidatesService],
  exports: [CandidatesService],
})
export class CandidatesModule {}
