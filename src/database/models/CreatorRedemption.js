import { defineModel } from "../defineModel.js";

export default defineModel("CreatorRedemption", {
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  creatorId: { type: String, required: true },
  code: { type: String, required: true },
  redeemedAt: { type: Date, default: Date.now },
}, { collection: "creator_redemptions" });
