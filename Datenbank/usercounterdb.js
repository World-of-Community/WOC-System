const { Schema, model } = require("mongoose");

const serverSchema = new Schema({
  guildId: { type: String, required: true, unique: true },
  highestUserCount: { type: Number, default: 0 },
});

module.exports = model("Server", serverSchema);
