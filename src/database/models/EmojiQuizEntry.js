import { defineModel } from "../defineModel.js";

// riddle pool, managed via /settings emoji add|remove|list
export default defineModel("EmojiQuizEntry", {
  begriff: { type: String, required: true, unique: true },
  emojis: { type: String, required: true },
  tipp: { type: String, default: "" },
  schwierigkeit: { type: String, enum: ["einfach", "mittel", "schwer"], default: "mittel" },
  aliases: { type: [String], default: [] },
  addedBy: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
}, { collection: "emojiquiz_entries" });
