import Discord from "discord.js";
import mongoose from "mongoose";

const threadSchema = new mongoose.Schema({
  threadID: {
    type: String,
    required: true,
  },

  creator: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
  },
});

export default mongoose.model("thread-data", threadSchema);
