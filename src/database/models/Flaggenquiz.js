import { defineModel } from "../defineModel.js";

// one active flag quiz per channel
export default defineModel("Flaggenquiz", {
  guildId: String,
  channelId: { type: String, unique: true },
  messageId: String,
  code: String,
  country: String,
  region: { type: String, default: null },
  imageUrl: String,
}, { collection: "flaggenquizzes" });
