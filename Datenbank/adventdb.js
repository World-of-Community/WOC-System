const mongoose = require('mongoose');

const adventSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  openedDays: { type: [Number], default: [] },
});

module.exports = mongoose.model('advent', adventSchema);
