import { defineModel } from "../defineModel.js";

export default defineModel("Flaggenquiz", {
  guildId: String,
  channelId: { type: String, unique: true },
  messageId: String,
  country: String,
  imageUrl: String,
}, { collection: "flaggenquizzes" });
