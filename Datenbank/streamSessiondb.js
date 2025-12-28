const mongoose = require("mongoose");

const streamSessionSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Discord User-ID
  start: { type: Date, required: true },                  // Startzeit der Session
  earned: { type: Number, default: 0 },                  // Bereits verdiente Coins in dieser Session
});

module.exports = mongoose.model("StreamSession", streamSessionSchema);
