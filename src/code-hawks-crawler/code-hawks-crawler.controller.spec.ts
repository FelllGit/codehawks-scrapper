import { Test, TestingModule } from '@nestjs/testing';
import { CodeHawksCrawlerController } from './code-hawks-crawler.controller';

describe('CodeHawksCrawlerController', () => {
  let controller: CodeHawksCrawlerController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CodeHawksCrawlerController],
    }).compile();

    controller = module.get<CodeHawksCrawlerController>(CodeHawksCrawlerController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
