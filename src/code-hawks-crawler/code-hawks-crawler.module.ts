// code-hawks-crawler.module.ts
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CodeHawksCrawlerService } from './code-hawks-crawler.service';
import {
  Web3SecurityContest,
  Web3SecurityContestSchema,
} from '../schemas/web3-security-contest.schema';
import {
  Web3BBProgram,
  Web3BBProgramSchema,
} from '../schemas/web3-bb-program.schema';
import { CodeHawksCrawlerController } from './code-hawks-crawler.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Web3BBProgram.name, schema: Web3BBProgramSchema },
      { name: Web3SecurityContest.name, schema: Web3SecurityContestSchema },
    ]),
  ],
  providers: [CodeHawksCrawlerService],
  exports: [CodeHawksCrawlerService],
  controllers: [CodeHawksCrawlerController],
})
export class CodeHawksCrawlerModule {}
