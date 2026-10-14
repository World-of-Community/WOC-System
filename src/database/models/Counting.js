import { defineModel } from "../defineModel.js";

export default defineModel("Counting", {
  guildId: String,
  channelId: String,
  messageId: String,
  highestCount: { type: Number, default: 0 },
  currentCount: { type: Number, default: 0 },
  lastUserId: String,
}, { collection: "countings" });
