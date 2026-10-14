import { defineModel } from "../defineModel.js";

export default defineModel("Timeout", {
  creator: String,
  user: { type: String, required: true, index: true },
  reason: String,
  duration: Number,
  startTime: Number,
  endTime: Number,
  proof: { type: String, default: null },
}, { collection: "timeout-schemas", timestamps: true });
