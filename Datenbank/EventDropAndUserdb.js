// models/EventDropAndUser.js
const mongoose = require('mongoose');

const eventDropAndUserSchema = new mongoose.Schema({
  event: {
    type: String,
    required: true,
    enum: ['active', 'inactive'],
  },
  channelId: {
    type: String,
    required: true,
  },
  users: [{
    userId: { type: String, required: true },
    eventDrops: { type: [String], default: [] },
  }]
}, { timestamps: true });

module.exports = mongoose.model('EventDropAndUser', eventDropAndUserSchema);
