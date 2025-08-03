const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  guildId: String,
  channelId: String,
  messageId: String,
  description: String,
  time: datum,
  participants: [String], // user IDs, die teilnehmen
  nonParticipants: [String], // user IDs, die nicht teilnehmen
});

const Meeting = mongoose.model('Meeting', meetingSchema);