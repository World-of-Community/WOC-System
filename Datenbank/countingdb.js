const mongoose = require("mongoose");

const countingSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  messageId: String,
  highestCount: {
    type: Number,
    default: 0,
  },
  currentCount: Number,
  lastUserId: String,
});

module.exports = mongoose.model("Counting", countingSchema);
