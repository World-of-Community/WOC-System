const mongoose = require('mongoose');

const teamInfoSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    bereich: {
        type: String,
        required: true,
    },
    beschreibung: {
        type: String,
        required: true,
    },
    alter: {
        type: String,
        required: true,
    },
    messages: {
        type: Number,
        default: 0
    },
});

module.exports = mongoose.model('TeamInfo', teamInfoSchema);
