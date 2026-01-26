// 📁 ./Datenbank/fussballdb.js
const mongoose = require('mongoose');

// ------------------------------------------------------
// ⚽ TEAM-SCHEMA
// ------------------------------------------------------
const teamSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  league: { type: String, enum: ['Pro League'], required: true },

  played: { type: Number, default: 0 },
  won: { type: Number, default: 0 },
  draw: { type: Number, default: 0 },
  lost: { type: Number, default: 0 },

  goalsFor: { type: Number, default: 0 },
  goalsAgainst: { type: Number, default: 0 },

  points: { type: Number, default: 0 },
  yellowCards: { type: Number, default: 0 },
  redCards: { type: Number, default: 0 },

  players: { type: [String], default: [] },
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
});

teamSchema.virtual('goalDifference').get(function () {
  return this.goalsFor - this.goalsAgainst;
});

teamSchema.virtual('calculatedPoints').get(function () {
  return this.won * 3 + this.draw;
});

const Team = mongoose.models.Team || mongoose.model('Team', teamSchema);

// ------------------------------------------------------
// 🏆 MATCH-SCHEMA
// ------------------------------------------------------
const matchSchema = new mongoose.Schema({
  homeTeam: { type: String, required: true },
  awayTeam: { type: String, required: true },
  matchday: { type: Number, required: true },
  date: { type: Date, required: true },
  endDate: { type: Date, required: true },
  homeScore: { type: Number, default: null },
  awayScore: { type: Number, default: null },
  events: [{
    time: Number,
    type: { type: String, enum: ['goal', 'yellow', 'red', 'substitution'] },
    player: String,
    team: String,
  }],
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

const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

// ------------------------------------------------------
// 📊 PROLEAGUE-EMBED-SCHEMA
// ------------------------------------------------------
const embedSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // z. B. "proleague_tabelle"
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
});

const ProLeagueEmbed = mongoose.models.ProLeagueEmbed || mongoose.model('ProLeagueEmbed', embedSchema);

// ------------------------------------------------------
// 📤 EXPORTS
// ------------------------------------------------------
module.exports = { Team, Match, ProLeagueEmbed };