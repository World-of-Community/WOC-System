const Discord = require('discord.js');
const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    guildID: {
        type: String,
        required: true,
    },
    messages: {
        type: String,
        required: false
    }

    
});

module.exports = mongoose.model('message-data', serverSchema)