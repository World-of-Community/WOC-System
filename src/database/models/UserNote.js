import { defineModel } from "../defineModel.js";

export default defineModel("UserNote", {
  userId: { type: String, index: true },
  guildId: String,
  authorId: String,
  note: String,
  createdAt: { type: Date, default: Date.now },
}, { collection: "usernotes" });
