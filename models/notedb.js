import mongoose from "mongoose";

const noteSchema = new mongoose.Schema({
    userId: String,
    guildId: String,
    authorId: String,
    note: String,
    createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("UserNote", noteSchema);
