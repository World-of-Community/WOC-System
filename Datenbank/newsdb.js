import mongoose from 'mongoose';

const newsStatusSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  isNewsEnabled: { type: Boolean, default: true } // Standardmäßig sind Neuigkeiten aktiviert
});

const NewsStatus = mongoose.model('NewsStatus', newsStatusSchema);
export default NewsStatus;
