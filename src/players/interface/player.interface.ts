import { Document } from 'mongoose';

export interface Player extends Document {
  readonly _id: string;
  readonly phone: string;
  readonly email: string;
  name: string;
  ranking: string;
  rankingPosition: number;
  avatar: string;
}
