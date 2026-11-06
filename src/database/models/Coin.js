import { defineModel } from "../defineModel.js";

const Coin = defineModel("Coin", {
  userId: { type: String, required: true, index: true },
  coins: { type: Number, default: 0 },
  usedCodes: { type: [String], default: [] },
  streak: { type: Number, default: 0 },
  lastDaily: Date,
}, { collection: "coins" });

export { Coin };
export default Coin;
