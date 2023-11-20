const Discord = require('discord.js');
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
});

module.exports = mongoose.model('user-data', userSchema)