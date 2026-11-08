import { defineModel } from "../defineModel.js";

export default defineModel("EventItem", {
  userId: { type: String, required: true, index: true },
  eventType: { type: String, required: true },
  amount: { type: Number, default: 0 },
  lastCollected: { type: Date, default: null },
}, {
  collection: "eventitems",
  indexes: [[{ userId: 1, eventType: 1 }, { unique: true }]],
});
