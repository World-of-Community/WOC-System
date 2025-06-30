const mongoose = require('mongoose');

const emojiquizVorschlagSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  begriff: { type: String, required: true },
  emojis: { type: String, required: true },
  schwierigkeit: { type: String, required: true },
  tipp: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('EmojiquizVorschlag', emojiquizVorschlagSchema);
