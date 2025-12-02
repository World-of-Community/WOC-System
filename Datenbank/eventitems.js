const mongoose = require("mongoose");

const eventItemSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  eventType: { type: String, required: true }, // z. B. "halloween", "easter", "christmas", "newyear"
  amount: { type: Number, default: 0 },
  lastCollected: { type: Date, default: null },
});

module.exports = mongoose.model("eventitems", eventItemSchema);
