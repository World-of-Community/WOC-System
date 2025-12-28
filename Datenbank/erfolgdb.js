const { model, Schema } = require("mongoose");

const erfolge = new Schema({
  userID: String,
  firstMessage: Boolean,
  idee: {
    type: Number,
    default: 0,
    max: 10,
  },
});

module.exports = model("erfolge", erfolge);
