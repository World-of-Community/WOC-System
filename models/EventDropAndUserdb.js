import mongoose from 'mongoose';

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
        required: true
      },
      eventDrops: {
        type: [String],
        default: [] // Array der gesammelten Gewinne (Level)
      }
    }
  ]
});

const EventDropAndUser = mongoose.model('EventDropAndUser', eventDropAndUserSchema);

export default EventDropAndUser;
