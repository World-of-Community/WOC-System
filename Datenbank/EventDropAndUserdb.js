const mongoose = require('mongoose');

// Schema für das EventDropAndUser-Modell
const eventDropAndUserSchema = new mongoose.Schema({
  event: { 
    type: String, 
    required: true, 
    enum: ['active', 'inactive'] // Das Event ist entweder aktiv oder inaktiv
  },
  channelId: { 
    type: String 
  },
  users: [
    {
      userId: { 
        type: String, 
        required: true // Die ID des Benutzers, der die Gewinne hat
      },
      eventDrops: { 
        type: [String], 
        default: [] // Array der gesammelten Gewinne (Level)
      }
    }
  ]
});

const EventDropAndUser = mongoose.model('EventDropAndUser', eventDropAndUserSchema);

module.exports = EventDropAndUser;
