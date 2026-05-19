import mongoose from 'mongoose';

const adventSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  openedDays: { type: [Number], default: [] },
});

export default mongoose.model('advent', adventSchema);
