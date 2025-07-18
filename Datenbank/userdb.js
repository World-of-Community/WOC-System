const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: {
        type: String
    },

    donation: Number,
    birthday: {
        tag: {
            type: Number,
            required: false,
        },
        monat: {
            type: Number,
            required: false,
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
            type: Number
        },
    
        toggledm: {
            type: Boolean
        },
    
        messages: {
            type: Number,
            default: 0
        },
    
        voiceTime: {
            type: Number,
            default: 0,
        },
    
        startTime: {
            type: Number
        },
    },

    stats: {
        messages: {
            type: Number,
            default: 0
        },
    
        voiceTime: {
            type: Number,
            default: 0
        },
    },

    erfolge: {
        informant: {
            type: Number,
            default: 0,
        },
        umfragen: {
            type: Number,
            default: 0,
        },
        glueckspilz: {
            type: Number,
            default: 0,
        }
    },

    firstMessage: {
        type: Boolean,
        default: false
    },

    onlineTime: { type: Number, default: 0 },
    lastOnline: { type: Number, default: 0 },
    
    invites: {
    joins: { type: Number, default: 0 },
    bonus: { type: Number, default: 0 },
    left: { type: Number, default: 0 }
    },

    invitedBy: {
    type: String,
    required: false,
    },
});

module.exports = mongoose.model('user-data', userSchema)