import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  guildID: {
    type: String,
    required: true,
    unique: true, // Nur eine ID zulassen
  },
  messages: {
    type: Number, // Muss eine Zahl sein!
    default: 0,
  },
});

export default mongoose.model("message-data", messageSchema);
