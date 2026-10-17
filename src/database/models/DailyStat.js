import { defineModel } from "../defineModel.js";

// One document per day (_id = "YYYY-MM-DD", Europe/Berlin), written by src/events/stats/dailyStats.js
// and read by the dashboard insights.
export default defineModel("DailyStat", {
  _id: { type: String, required: true },
  joins: { type: Number, default: 0 },
  leaves: { type: Number, default: 0 },
  messages: { type: Number, default: 0 },
  voiceMinutes: { type: Number, default: 0 },
  voiceSessions: { type: Number, default: 0 },
  voicePeak: { type: Number, default: 0 }, // most members in voice at the same time
  members: { type: Number, default: 0 },
  hours: { type: Object, default: {} }, // "0".."23" -> messages
}, { collection: "daily_stats" });
