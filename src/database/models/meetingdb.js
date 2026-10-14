import mongoose from "mongoose";

const meetingSchema = new mongoose.Schema({
  guildId: { type: String, required: true },
  channelId: { type: String, required: true },
  messageId: { type: String, required: true },
  description: { type: String, required: true },
  time: { type: Date, required: true }, // Zeit als Date speichern
  participants: { type: [String], default: [] }, // User-IDs
  nonParticipants: { type: [String], default: [] },
});

const Meeting = mongoose.model("Meeting", meetingSchema);

export default Meeting;
