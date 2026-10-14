import { defineModel } from "../defineModel.js";

export default defineModel("Advent", {
  userId: { type: String, required: true, index: true },
  openedDays: { type: [Number], default: [] },
}, { collection: "advents" });
