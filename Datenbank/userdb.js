const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    donation: Number,
    birthday: {
        tag: {
            type: Number,
            required: false ,
        },
        monat: {
            type: Number,
            required: false ,
        },
        jahr: {
            type: Number,
            required: false,
        },
    },
    reactions: {
        type: Object,
        required: false,
    },
    afk: {
        type: Boolean,
        required: false,
    },
    afkReason: {
        type: String,
        required: false,
    },
    afkStamp: {
        type: String,
        required: false,
    },
    vorstellungID: {
        type: String,
        required: false,
    },
    giveaway: {
        eventWins: {
            type: Number,
            required: true,
        },
    
        toggledm: {
            type: Boolean,
            required: true,
        },
    
        messages: {
            type: Number,
            required: true,
        },
    
        voiceTime: {
            type: Number,
            required: true,
        },
    
        startTime: {
            type: Number,
            required: true,
        },
    },
    stats: {
        messages: {
            type: Number,
            required: true,
        },
    
        voiceTime: {
            type: Number,
            required: true,
        },
    }
});

module.exports = mongoose.model('user-data', userSchema)