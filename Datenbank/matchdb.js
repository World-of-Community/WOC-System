const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  homeTeam: { type: String, required: true, trim: true },
  awayTeam: { type: String, required: true, trim: true },
  matchday: { type: Number, required: true },
  date: { type: Date, required: true },
  homeScore: { type: Number, default: null }, // Tore Heimteam, null = noch nicht gesetzt
  awayScore: { type: Number, default: null }, // Tore Auswärtsteam, null = noch nicht gesetzt
}, {
  timestamps: true,
});

const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

module.exports = Match;
