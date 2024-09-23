const mongoose = require('mongoose');

// Erstelle ein Schema für die Leaderboard-Nachrichten-ID
const leaderboardSchema = new mongoose.Schema({
    messageId: { type: String, required: true }
});

// Exportiere das Modell
module.exports = mongoose.model('Leaderboard', leaderboardSchema);