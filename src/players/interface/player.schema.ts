import * as mongoose from 'mongoose';

const PlayerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: { type: String, required: true },
    ranking: { type: String },
    rankingPosition: { type: Number },
    avatar: { type: String },
  },
  { timestamps: true, collections: 'players' },
);

export default PlayerSchema;
