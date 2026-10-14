import { defineModel } from "../defineModel.js";

export default defineModel("Giveaway", {
  channelID: { type: String, required: true },
  creator: { type: String, required: true },
  price: { type: String, required: true },
  msgID: { type: String, required: true, index: true },
  teilnehmer: { type: [String], default: [] },
  bedingung: String,
  bedingungString: String,
  duration: { type: Number, required: true },
  startTime: { type: Number, required: true },
  endTime: { type: Number, default: null },
  gewinnerAnzahl: { type: Number, default: 1 },
  voiceTime: { type: Number, default: 0 },
}, { collection: "giveaway-datas" });
