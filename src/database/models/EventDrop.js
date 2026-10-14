import { defineModel } from "../defineModel.js";

export default defineModel("EventDrop", {
  event: { type: String, required: true, enum: ["active", "inactive"] },
  channelId: String,
  users: [{
    userId: { type: String, required: true },
    eventDrops: { type: [String], default: [] },
  }],
}, { collection: "eventdropandusers" });
