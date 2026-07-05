import mongoose from 'mongoose';

// Erstelle ein Schema für die Leaderboard-Nachrichten-ID
const leaderboardSchema = new mongoose.Schema({
    guildId: { type: String, required: true },
    channelId: { type: String, required: true },
    messageId: { type: String, required: true }
});

// Exportiere das Modell
export default mongoose.model('Leaderboard', leaderboardSchema);
