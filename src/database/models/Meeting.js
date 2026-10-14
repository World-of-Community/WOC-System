import { defineModel } from "../defineModel.js";

export default defineModel("Meeting", {
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: Date, required: true },
  participants: { type: [String], default: [] },
  nonParticipants: { type: [String], default: [] },
}, { collection: "meetings" });
