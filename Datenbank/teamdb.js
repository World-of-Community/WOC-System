const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    userID: {
        type: String,
        required: true,
    },
    messages: {
        type: Number,
        default: 0
    },
    counter: {
        urlaub: { // Urlaub genommen
            type: Number,
            default: 0,
        },
        tasks: { // Abgeschlossene Aufgaben
            type: Number,
            default: 0,
        },
        besprechung: { // Teilgenommene Besprechungen
            type: Number,
            default: 0,
        }
    },
    urlaub: {
        beginn: {
            type: String, // You might want to change this to Date if it's a date field
        },
        ende: {
            type: String, // Same here, Date might be more appropriate
        },
        grund: {
            type: String,
            default: "Kein Grund angegeben",
        },
        messageID: {
            type: String,
        },
    },
    teaminfo: {
        userName: {  // Speichere den Namen des Nutzers
          type: String,
          required: [true, 'userName ist erforderlich.'],
        },
        bereich: {
          type: String,
        },
        beschreibung: {
          type: String,
        },
        alter: {
          type: String,
        },
        role: {
          type: String,
        },
      },  
});

module.exports = mongoose.model('team-data', teamSchema);
