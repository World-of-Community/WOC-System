const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  userId: String,
  name: String,
  reason: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Blacklist', blacklistSchema);
