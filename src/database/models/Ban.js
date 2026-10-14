import { defineModel } from "../defineModel.js";

export default defineModel("Ban", {
  creator: String,
  userId: { type: String, required: true, index: true },
  reason: String,
  duration: Number,
  startTime: Number,
  endTime: Number,
}, { collection: "ban-schemas" });
