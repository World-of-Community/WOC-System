const mongoose = require('mongoose');

const blacklistSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  reason: { type: String, default: 'Kein Grund angegeben' }
});

module.exports = mongoose.model('Blacklist', blacklistSchema);
