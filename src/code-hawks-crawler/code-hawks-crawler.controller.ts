import { Controller, Get, Logger } from '@nestjs/common';
import { CodeHawksCrawlerService } from './code-hawks-crawler.service';

@Controller('code-hawks-crawler')
export class CodeHawksCrawlerController {
  constructor(
    private readonly codeHawksCrawlerService: CodeHawksCrawlerService,
  ) {}
  private readonly logger = new Logger(CodeHawksCrawlerService.name);

  @Get()
  async getCodeHawksContests() {
    this.logger.log(
      `Starting to crawl ${this.codeHawksCrawlerService.name}...`,
    );
    const start_time = Date.now();
    return await this.codeHawksCrawlerService.crawl().then((result) => {
      const end_time = Date.now();
      this.logger.log(
        `Finished crawling ${this.codeHawksCrawlerService.name} in ${end_time - start_time}ms`,
      );
      return result;
    });
  }
}
