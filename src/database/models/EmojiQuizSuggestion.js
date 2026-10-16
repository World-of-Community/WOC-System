import { defineModel } from "../defineModel.js";

// user suggestions from the emoji quiz, reviewed by the team
export default defineModel("EmojiQuizSuggestion", {
  userId: { type: String, required: true },
  username: String,
  begriff: { type: String, required: true },
  emojis: { type: String, required: true },
  schwierigkeit: { type: String, default: "mittel" },
  tipp: { type: String, default: "" },
  status: { type: String, enum: ["offen", "angenommen", "abgelehnt"], default: "offen" },
  reviewedBy: { type: String, default: null },
  messageId: { type: String, default: null },
  timestamp: { type: Date, default: Date.now },
}, { collection: "emojiquizvorschlags" });
