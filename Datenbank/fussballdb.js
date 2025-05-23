// fussballdb.js (Datenbank-Schema und Model)
const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  league: { type: String, enum: ["Pro League"], required: true },
  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  draw: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },
  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },
  goalDifference: { type: Number, default: 0 },
  points: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 }
});

const matchSchema = new mongoose.Schema({
  team1: { type: teamSchema, required: true },
  team2: { type: teamSchema, required: true },
  score1: { type: Number, required: true },
  score2: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  events: { type: [String], default: [] },
  yellowCards: { type: Map, of: Number, default: {} },
  redCards: { type: Map, of: Number, default: {} }
});

module.exports = {
  Team: mongoose.model('Team', teamSchema),
  Match: mongoose.model('Match', matchSchema)
};
