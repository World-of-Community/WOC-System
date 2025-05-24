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

  // goalDifference wird virtuell berechnet
  // du kannst es auch speichern, aber dann musst du es beim Update synchronisieren
  // hier besser virtuell (wird nicht in DB gespeichert)
  goalDifference: {
    type: Number,
    default: 0,
  },

  points: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },

  // Spieler als Array von Strings (Namen oder IDs)
  // falls Spieler eigene Dokumente sind: type: [mongoose.Schema.Types.ObjectId], ref: 'Player'
  players: { type: [String], default: [] },

}, {
  timestamps: true,
});

// Virtuelle Eigenschaft für goalDifference (nur zur Laufzeit, nicht gespeichert)
teamSchema.virtual('goalDifferenceVirtual').get(function () {
  return this.goalsFor - this.goalsAgainst;
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

// Export
module.exports = {
  Team: mongoose.model('Team', teamSchema),
  Match: mongoose.model('Match', matchSchema),
};


/*

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

  // ✅ Spielerfeld hinzugefügt
  players: { type: [String], default: [] },

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
*/
