const mongoose = require("mongoose");

const coinSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  coins: { type: Number, default: 0 },
  streak: { type: Number, default: 0 },
  lastDaily: { type: Date },
});

const coinConfigSchema = new mongoose.Schema({
  guildId: { type: String, required: true, unique: true },
  minCoins: { type: Number, default: 1 },
  maxCoins: { type: Number, default: 5 },
});

module.exports = {
  Coin: mongoose.models.Coin || mongoose.model("Coin", coinSchema),
  CoinConfig: mongoose.models.CoinConfig || mongoose.model("CoinConfig", coinConfigSchema),
};
