import { defineModel } from "../defineModel.js";

export default defineModel("Achievement", {
  userID: { type: String, index: true },
  firstMessage: { type: Boolean, default: false },
  idee: { type: Number, default: 0, max: 10 },
  gewinnspiel: { type: Number, default: 0 },
}, { collection: "erfolges" });
