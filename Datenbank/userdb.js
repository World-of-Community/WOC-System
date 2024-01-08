const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
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