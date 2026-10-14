import { defineModel } from "../defineModel.js";

export default defineModel("Termin", {
  userId: { type: String, required: true, unique: true },
  timestamp: { type: Number, required: true },
  createdBy: { type: String, required: true },
  teamMemberId: String,
}, { collection: "termins" });
