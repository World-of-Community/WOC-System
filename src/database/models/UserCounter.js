import { defineModel } from "../defineModel.js";

export default defineModel("UserCounter", {
  guildId: { type: String, required: true, unique: true },
  highestUserCount: { type: Number, default: 0 },
}, { collection: "servers" });
