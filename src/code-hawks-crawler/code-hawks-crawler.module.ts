import { Module } from '@nestjs/common';
import { CodeHawksCrawlerService } from './code-hawks-crawler.service';
import { CodeHawksCrawlerController } from './code-hawks-crawler.controller';

@Module({
  imports: [],
  providers: [CodeHawksCrawlerService],
  exports: [CodeHawksCrawlerService],
  controllers: [CodeHawksCrawlerController],
})
export class CodeHawksCrawlerModule {}
