import { Schema, model } from 'mongoose';

const terminSchema = new Schema({
  userId: { type: String, required: true, unique: true },
  timestamp: { type: Number, required: true },
  createdBy: { type: String, required: true },
  teamMemberId: { type: String, required: false },
});

export default model('Termin', terminSchema);
