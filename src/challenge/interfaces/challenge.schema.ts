import * as mongoose from 'mongoose';

export const ChallengeSchema = new mongoose.Schema(
  {
    challengeDateTime: { type: Date, required: true },
    status: { type: String, required: true },
    requestDateTime: { type: Date, required: true },
    responseDateTime: { type: Date },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Player',
      required: true,
    },
    category: { type: String, required: true },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true }],
    match: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
  },
  { timestamps: true, collection: 'challenges' },
);
