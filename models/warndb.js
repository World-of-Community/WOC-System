import mongoose from 'mongoose';

const warnSchema = new mongoose.Schema({
    guildId: {
        type: String,
        required: true,
        index: true
    },
    userId: {
        type: String,
        required: true,
        index: true
    },
    warnings: [
        {
            reason: { type: String, required: true },
            date: { type: Date, default: Date.now }
        }
    ],
    proof: { type: String, default: null }

});

// Verhindert doppelte Einträge pro Guild + User
warnSchema.index({ guildId: 1, userId: 1 }, { unique: true });

export default mongoose.model('Warning', warnSchema);
