const mongoose = require('mongoose');

// Team-Schema
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  league: { type: String, enum: ['Pro League'], required: true },
  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  draw: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  goalDifference: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },
}, {
  timestamps: true,
});

// Match-Schema
const matchSchema = new mongoose.Schema({
  team1: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  team2: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  score1: { type: Number, required: true },
  score2: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  events: { type: [String], default: [] },
  yellowCards: {
    type: Map,
    of: Number,
    default: {},
  },
  redCards: {
    type: Map,
    of: Number,
    default: {},
  },
}, {
  timestamps: true,
});

// Modelle exportieren
module.exports = {
  Team: mongoose.model('Team', teamSchema),
  Match: mongoose.model('Match', matchSchema),
};
