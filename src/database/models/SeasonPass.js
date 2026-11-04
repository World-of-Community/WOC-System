import { defineModel } from "../defineModel.js";

export default defineModel("SeasonPass", {
  userId: { type: String, required: true, unique: true, index: true },
  seasonId: { type: String, required: true },
  startedAt: { type: Date, required: true },
  expiresAt: { type: Date, required: true },
  xp: { type: Number, default: 0 },
  lastActiveDay: { type: String, default: null },
  premium: { type: Boolean, default: false },
  premiumStages: { type: Number, default: 0 },
  redeemedStages: { type: [Number], default: [] },
  creatorCode: { type: String, default: null },
}, { collection: "season-passes" });
