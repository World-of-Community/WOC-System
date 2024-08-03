const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    counter: {
        urlaub: { //Urlaub genommen
            type: Number,
            default: 0,
        },
        tasks: { //Abgeschlossene Aufgaben
            type: Number,
            default: 0,
        },
        besprechung: { //Teilgenommene Besprechung
            type: Number,
            default: 0,
        }
    },
    urlaub: {
        beginn: {
            type: String,
        },
        ende: {
            type: String,
        },
        grund: {
            type: String,
            default: "Kein Grund angegeben"
        },
        messageID: {
            type: String,
        },
    },
});

module.exports = mongoose.model('team-data', teamSchema)