const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  userId: { type: String, unique: true, sparse: true },
  username: String,
  minecraftName: { type: String, unique: true, sparse: true },
  reason: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blacklist', blacklistSchema);
