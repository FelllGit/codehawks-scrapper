// web3-bb-program.schema.ts
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema()
export class Web3BBProgram extends Document {
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

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const Web3BBProgramSchema = SchemaFactory.createForClass(Web3BBProgram);
