import { defineModel } from "../defineModel.js";

export default defineModel("NewsStatus", {
  userId: { type: String, required: true, unique: true },
  isNewsEnabled: { type: Boolean, default: true },
}, { collection: "newsstatuses" });
