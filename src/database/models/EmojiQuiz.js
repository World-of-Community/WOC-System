import { defineModel } from "../defineModel.js";

// one active emoji quiz per channel
export default defineModel("EmojiQuiz", {
  guildId: String,
  channelId: { type: String, unique: true },
  messageId: String,
  entryId: { type: String, default: null },
  begriff: { type: String, default: null },
  schwierigkeit: { type: String, default: null },
}, { collection: "emojiquizzes" });
