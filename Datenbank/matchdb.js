const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  homeTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
  awayTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', required: true },
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
}, { timestamps: true });

const Match = mongoose.models.Match || mongoose.model('Match', matchSchema);

module.exports = { Match };

/*
const mongoose = require('mongoose');

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

module.exports = { Match };
*/