import { Schema, model } from "mongoose";

const serverSchema = new Schema({
    guildId: { type: String, required: true, unique: true },
    highestUserCount: { type: Number, default: 0 },
});

export default model("Server", serverSchema);
