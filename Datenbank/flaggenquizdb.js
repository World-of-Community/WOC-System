const mongoose = require('mongoose');

const flaggenQuizSchema = new mongoose.Schema({
  guildId: String,
  channelId: { type: String, unique: true },
  messageId: String,
  country: String,
  imageUrl: String
});

const FlaggenQuiz =
  mongoose.models.FlaggenQuiz ||
  mongoose.model('FlaggenQuiz', flaggenQuizSchema);