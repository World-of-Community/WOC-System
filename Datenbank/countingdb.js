const mongoose = require('mongoose');

const countingSchema = new mongoose.Schema({
    guildId: String,
    channelId: String,
    highestCount: Number,
    currentCount: Number,
    lastUserId: String
});

const CountingModel = mongoose.model('Counting', countingSchema);