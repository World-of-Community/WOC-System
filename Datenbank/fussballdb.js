const mongoose = require('mongoose');

// Team-Schema (Teil von Fußball-Daten)
const teamSchema = new mongoose.Schema({
  name: String,
  league: { type: String, enum: ["Pro League", "2. League"] },
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

// Match-Schema
const matchSchema = new mongoose.Schema({
  team1: teamSchema,    // eingebettetes Team-Objekt
  team2: teamSchema,    // eingebettetes Team-Objekt
  score1: Number,
  score2: Number,
  date: { type: Date, default: Date.now },
  events: [String], // z.B. ["⚽ 12' Tor FC Adler"]
  yellowCards: { type: Map, of: Number },
  redCards: { type: Map, of: Number }
});

// Export: Zwei Modelle in einer Datei
module.exports = {
  Team: mongoose.model('Team', teamSchema),
  Match: mongoose.model('Match', matchSchema)
};

