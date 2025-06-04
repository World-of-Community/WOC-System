const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchday: { type: Number, required: true, min: 1, max: 34 },
  homeTeam: { type: String, required: true, trim: true },
  awayTeam: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  stadium: { type: String, default: '' },
  homeGoals: { type: Number, default: null },
  awayGoals: { type: Number, default: null }
}, { timestamps: true });

module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
