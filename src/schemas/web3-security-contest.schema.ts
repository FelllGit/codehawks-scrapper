export enum Web3SecurityContestStatus {
  UNKNOWN = 'UNKNOWN',
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  EVALUATING = 'EVALUATING',
  FINISHED = 'FINISHED',
}

export interface Web3SecurityContest {
  program: string;
  slug: string;
  platform: string;
  imageUrl: string;
  originalUrl: string;
  languages: string[];
  maxReward: number;
  rewardsPool: number;
  rewardsToken: string;
  startDate: Date;
  endDate: Date;
  evaluationEndDate: Date;
  status: Web3SecurityContestStatus;
  tags: string[];
}
