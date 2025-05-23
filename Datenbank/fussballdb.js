const mongoose = require('mongoose');

// Team-Schema (Teil von Fußball-Daten)
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true },
  league: { type: String, enum: ["Pro League", "2. Liga"], required: true },
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

// Match-Schema mit eingebetteten Team-Objekten
const matchSchema = new mongoose.Schema({
  team1: teamSchema,    // eingebettetes Team-Objekt
  team2: teamSchema,    // eingebettetes Team-Objekt
  score1: { type: Number, required: true },
  score2: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  events: [String], // z.B. ["⚽ 12' Tor FC Adler"]
  yellowCards: { type: Map, of: Number, default: {} },
  redCards: { type: Map, of: Number, default: {} }
});

// Exportiere die Modelle
module.exports = {
  Team: mongoose.model('Team', teamSchema),
  Match: mongoose.model('Match', matchSchema)
};
