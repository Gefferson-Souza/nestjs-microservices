import * as mongoose from 'mongoose';

// Schema para o resultado (sets) de uma partida
const ResultSchema = new mongoose.Schema({
  set: { type: String, required: true },
});

// Schema para a partida
export const MatchSchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    players: [{ 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Player',
      required: true 
    }],
    def: { 
      type: mongoose.Schema.Types.ObjectId, 
      ref: 'Player',
      required: true 
    },
    result: [ResultSchema],
  },
  { 
    timestamps: true, 
    collection: 'matches' 
  }
);

export default MatchSchema;