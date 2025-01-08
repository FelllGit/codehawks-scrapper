import { Test, TestingModule } from '@nestjs/testing';
import { CodeHawksCrawlerService } from './code-hawks-crawler.service';

describe('CodeHawksCrawlerService', () => {
  let service: CodeHawksCrawlerService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CodeHawksCrawlerService],
    }).compile();

    service = module.get<CodeHawksCrawlerService>(CodeHawksCrawlerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
