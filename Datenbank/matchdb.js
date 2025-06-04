const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
  matchday: {
    type: Number,
    required: true,
    min: 1,
    max: 34, // 34 Spieltage
  },
  homeTeam: {
    type: String,
    required: true,
    trim: true
  },
  awayTeam: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  stadium: {
    type: String,
    default: '' // optional, z.B. Stadionname
  },
  homeGoals: {
    type: Number,
    default: null
  },
  awayGoals: {
    type: Number,
    default: null
  }
}, {
  timestamps: true // createdAt, updatedAt automatisch
});

// Exportiert das Model, falls schon vorhanden wird das vorhandene benutzt (Hot-Reload freundlich)
module.exports = mongoose.models.Match || mongoose.model('Match', matchSchema);
