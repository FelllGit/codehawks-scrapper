// web3-security-contest.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export enum Web3SecurityContestStatus {
  UNKNOWN = 'UNKNOWN',
  UPCOMING = 'UPCOMING',
  ONGOING = 'ONGOING',
  EVALUATING = 'EVALUATING',
  FINISHED = 'FINISHED',
}

@Schema()
export class Web3SecurityContest extends Document {
  @Prop({ required: true })
  program: string;

  @Prop({ required: true })
  slug: string;

  @Prop({ required: true })
  platform: string;

  @Prop({ required: true })
  imageUrl: string;

  @Prop({ required: true })
  originalUrl: string;

  @Prop({ type: [String], default: [] })
  languages: string[];

  @Prop({ required: true })
  maxReward: number;

  @Prop({ required: true })
  rewardsPool: number;

  @Prop({ required: true })
  rewardsToken: string;

  @Prop({ required: true })
  startDate: Date;

  @Prop({ required: true })
  endDate: Date;

  @Prop({ required: true })
  evaluationEndDate: Date;

  @Prop({
    required: true,
    enum: Web3SecurityContestStatus,
    default: Web3SecurityContestStatus.UNKNOWN,
  })
  status: Web3SecurityContestStatus;

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const Web3SecurityContestSchema =
  SchemaFactory.createForClass(Web3SecurityContest);
