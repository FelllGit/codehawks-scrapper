// src/crawler/crawler.interface.ts
import { Web3BBProgram } from '../schemas/web3-bb-program.schema';
import { Web3SecurityContest } from '../schemas/web3-security-contest.schema';

export type CrawledProgram = Web3BBProgram | Web3SecurityContest;

export interface Crawler {
  name: string;
  crawl(): Promise<CrawledProgram[]>;
}
