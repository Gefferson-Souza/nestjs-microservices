import * as mongoose from 'mongoose';

// Schema para o resultado aninhado dentro da partida
const ResultSchema = new mongoose.Schema({
  set: { type: String, required: true },
});

// Schema para a partida aninhada
export const MatchSchema = new mongoose.Schema(
  {
    category: { type: String },
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
    def: { type: mongoose.Schema.Types.ObjectId, ref: 'Player' },
    result: [ResultSchema],
  },
  { timestamps: true, _id: true }, 
);

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
    players: [
      { type: mongoose.Schema.Types.ObjectId, ref: 'Player', required: true },
    ],
    match: { type: MatchSchema },
  },
  { timestamps: true, collection: 'challenges' },
);