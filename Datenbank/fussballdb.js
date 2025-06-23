const mongoose = require('mongoose');

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

const Team = mongoose.model('Team', teamSchema);

module.exports = { Team, Match };
