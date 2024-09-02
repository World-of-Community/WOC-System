const mongoose = require('mongoose');

const giveawaySchema = new mongoose.Schema({
    channelID: {
        type: String,
        required: true,
    },

    creator: {
        type: String,
        required: true,
    },

    price: {
        type: String,
        required: true,
    },

    msgID: {
        type: String,
        required: true,
    },

    teilnehmer: {
        type: Object,
        required: false,
    },

    bedingung: {
        type: String,
        required: false,
    },

    bedingungString: {
        type: String,
        required: false,
    },

    duration: {
        type: Number,
        required: true,
    },

    startTime: {
        type: Number,
        required: true,
    },

    endTime: {
        type: Number,
        required: false,
    },
    gewinnerAnzahl: {
        type: Number,
        required: false,
        default: 1
    }
});

module.exports = mongoose.model('giveaway-data', giveawaySchema)