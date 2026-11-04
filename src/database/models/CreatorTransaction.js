import { defineModel } from "../defineModel.js";

export default defineModel("CreatorTransaction", {
  _id: { type: String, required: true },
  creatorId: { type: String, required: true },
  userId: { type: String, required: true },
  amount: { type: Number, required: true },
  commission: { type: Number, required: true },
  status: {
    type: String,
    enum: ["open", "paid"],
    default: "open",
  },
  createdAt: { type: Date, default: Date.now },
}, { collection: "creator_transactions" });
