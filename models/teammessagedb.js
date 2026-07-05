import mongoose from "mongoose";

const teammessageSchema = new mongoose.Schema({
  userID: {
    type: String,
    required: true,
    unique: true,
  },
  messageCount: {
    type: Number,
    default: 0,
  },
  lastMessageAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

/**
 * Gibt die Nachrichtenanzahl eines Team-Mitglieds zurück.
 * @param {string} userId - Die Discord-User-ID
 * @returns {Promise<number>}
 */
teammessageSchema.statics.getMessageCount = async function (userId) {
  const doc = await this.findOne({ userID: userId });
  return doc ? doc.messageCount : 0;
};

export default mongoose.model("team-message-data", teammessageSchema);
