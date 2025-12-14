const mongoose = require("mongoose");

const noteSchema = new mongoose.Schema({
    userId: String,
    guildId: String,
    authorId: String,
    note: String,
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("UserNote", noteSchema);