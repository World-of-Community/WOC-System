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
            required: true,
        },
        monat: {
            type: Number,
            required: true,
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
    }
});

module.exports = mongoose.model('user-data', userSchema)