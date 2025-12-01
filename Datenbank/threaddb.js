const mongoose = require("mongoose");

const threadSchema = new mongoose.Schema({
  threadID: {
    type: String,
    required: true,
  },

  creator: {
    type: String,
    required: true,
  },

  createdAt: {
    type: Date,
    required: true,
  },
});

module.exports = mongoose.model("thread-data", threadSchema);
