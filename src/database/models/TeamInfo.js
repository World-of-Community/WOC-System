import { defineModel } from "../defineModel.js";

export default defineModel("TeamInfo", {
  userID: { type: String, required: true, index: true },
  bereich: { type: String, required: true },
  aufgabe: { type: String, required: true },
  alter: { type: String, required: true },
  messages: { type: Number, default: 0 },
}, { collection: "teaminfos" });
