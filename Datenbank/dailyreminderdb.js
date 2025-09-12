const mongoose = require('mongoose');

const reminderSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // eindeutige ID für jeden Reminder
  messageId: { type: String }
});

const Reminder = mongoose.model('Reminder', reminderSchema);

module.exports = Reminder;