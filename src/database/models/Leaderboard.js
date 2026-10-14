import { defineModel } from "../defineModel.js";

export default defineModel("Leaderboard", {
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
}, { collection: "leaderboards" });
