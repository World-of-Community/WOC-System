const mongoose = require('mongoose');

const flaggenquizSchema = new mongoose.Schema({
  guildId: String,
  channelId: { type: String, unique: true },
  messageId: String,
  country: String,
  imageUrl: String
});

const Flaggenquiz =
  mongoose.models.FlaggenQuiz ||
  mongoose.model('Flaggenquiz', flaggenquizSchema);