import { defineModel } from "../defineModel.js";

export default defineModel("Warning", {
  guildId: { type: String, required: true },
  userId: { type: String, required: true },
  warnings: [{
    reason: { type: String, required: true },
    date: { type: Date, default: Date.now },
  }],
  proof: { type: String, default: null },
}, { collection: "warnings", indexes: [[{ guildId: 1, userId: 1 }, { unique: true }]] });
