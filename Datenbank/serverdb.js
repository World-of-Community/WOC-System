const Discord = require('discord.js');
const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    guildID: {
        type: String,
        required: true,
    },
    partner: {
        msg: {
            type: String,
            required: false,
        },
        channel: {
            type: String,
            required: false,
        },
        partners: [{
            name: String,
            category: String,
            ownerID: String,
            invite: String

        }]
    },
    deactivated: {
        type: Object,
        required: false,
    },

    updateMessage: {
        type: String,
        required: false,
    },
    
    updateWeek: {
        type: String,
        required: false,
    },

    support: {
        type: Object,
        required: false,
    },

    system: {
        type: Object,
        required: false,
    },

    gift: {
        type: Object,
        required: false,
    },

    verify: {
        type: Object,
        required: false,
    },

    minecraft: {
        type: Object,
        required: false,
    },
    webseite: {
        type: Object,
        required: false,
    },
    dc: {
        type: Object,
        required: false,
    },
    service: {
        type: Object,
        required: false,
    },
});

module.exports = mongoose.model('server-data', serverSchema)