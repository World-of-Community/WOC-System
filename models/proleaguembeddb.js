import mongoose from "mongoose";

const embedSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // z. B. "proleague_tabelle"
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
});

export default mongoose.model("ProLeagueEmbed", embedSchema);
