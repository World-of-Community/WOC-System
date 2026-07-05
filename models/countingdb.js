import mongoose from "mongoose";

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

export default mongoose.model("Counting", countingSchema);
