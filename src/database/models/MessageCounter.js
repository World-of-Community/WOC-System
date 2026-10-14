import { defineModel } from "../defineModel.js";

export default defineModel("MessageCounter", {
  guildID: { type: String, required: true, unique: true },
  messages: { type: Number, default: 0 },
}, { collection: "message-datas" });
