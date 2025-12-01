const mongoose = require("mongoose");

const timeoutSchema = new mongoose.Schema(
    {
        creator: {
            type: String,
            required: false,
        },
        user: {
            type: String,
            required: true,
        },
        reason: {
            type: String,
            required: false,
        },
        duration: {
            type: Number,
            required: false,
        },
        startTime: {
            type: Number,
            required: false,
        },
        endTime: {
            type: Number,
            required: false,
        },
    },
    {
        timestamps: true // <--- KORREKT PLATZIERT
    }
);

module.exports = mongoose.model('timeout-schema', timeoutSchema);
