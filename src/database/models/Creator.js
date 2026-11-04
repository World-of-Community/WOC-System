import { defineModel } from "../defineModel.js";

export default defineModel("Creator", {
  _id: { type: String, required: true },
  userId: { type: String, required: true },
  code: { type: String, required: true },
  active: { type: Boolean, default: true },
  bonus: { type: Number, default: 500 },
  commission: { type: Number, default: 10 },
  uses: { type: Number, default: 0 },
  sales: { type: Number, default: 0 },
  earned: { type: Number, default: 0 },
  paid: { type: Number, default: 0 },
}, { collection: "creators" });
