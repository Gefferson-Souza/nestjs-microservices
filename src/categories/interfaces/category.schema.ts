import * as mongoose from 'mongoose';

export const CategorySchema = new mongoose.Schema(
  {
    category: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String, required: true },
    events: [
      {
        name: { type: String, required: true },
        operation: { type: String, required: true },
        value: { type: Number, required: true },
      },
    ],
    players: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Player' }],
  },
  { timestamps: true },
);

export default CategorySchema;
