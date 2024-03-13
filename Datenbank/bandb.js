const Discord = require('discord.js');
const mongoose = require('mongoose');

const banSchema = new mongoose.Schema({
    creator: {
        type: String,
        required: true,
    },
    user: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: true,
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
});

module.exports = mongoose.model('ban-schema', banSchema)