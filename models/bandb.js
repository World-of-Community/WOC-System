import Discord from 'discord.js';
import mongoose from 'mongoose';

const banSchema = new mongoose.Schema({
    creator: {
        type: String,
        required: false,
    },
    userId: {
        type: String,
        required: true,
    },
    reason: {
        type: String,
        required: false,
    },
    duration: {
        type: Number,
        required: false,
    },
    startTime: {
        type: Number,
        required: false,
    },
    endTime: {
        type: Number,
        required: false,
    },
});

export default mongoose.model('ban-schema', banSchema);
