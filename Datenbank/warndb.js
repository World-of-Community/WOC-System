const mongoose = require('mongoose');

const warnSchema = new mongoose.Schema({
    guildId: String,
    userId: String,
    warnings: [
        {
            reason: String,
            date: { type: Date, default: Date.now },
        },
    ],
});

module.exports = mongoose.model('Warning', warnSchema);