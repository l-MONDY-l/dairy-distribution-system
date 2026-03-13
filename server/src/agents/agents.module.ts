import { Module } from '@nestjs/common';
import { AgentsController } from './agents.controller';
import { AgentsService } from './agents.service';
import { AgentsStatsController } from './agents.stats.controller';

@Module({
  controllers: [AgentsController, AgentsStatsController],
  providers: [AgentsService],
  exports: [AgentsService],
})
export class AgentsModule {}

