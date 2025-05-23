// Datenbank/embeddb.js
const mongoose = require('mongoose');

const embedSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true }, // z. B. "proleague_tabelle"
  channelId: { type: String, required: true },
  messageId: { type: String, required: true }
});

module.exports = mongoose.model('EmbedDB', embedSchema);
