const mongoose = require("mongoose");

const discordBlacklistSchema = new mongoose.Schema({
  userId: { type: String, unique: true, sparse: true },
  username: String,
  reason: String,
  date: { type: Date, default: Date.now },
}, { collection: "discordBlacklist" });

const minecraftBlacklistSchema = new mongoose.Schema({
  minecraftName: { type: String, unique: true, sparse: true },
  reason: String,
  date: { type: Date, default: Date.now },
}, { collection: "minecraftBlacklist" });

const DiscordBlacklist = mongoose.model("DiscordBlacklist", discordBlacklistSchema);
const MinecraftBlacklist = mongoose.model("MinecraftBlacklist", minecraftBlacklistSchema);

module.exports = { DiscordBlacklist, MinecraftBlacklist };
