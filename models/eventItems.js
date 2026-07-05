import mongoose from 'mongoose';

const eventItemSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true
    },
    eventType: {
        type: String,
        required: true
    },
    amount: {
        type: Number,
        default: 0
    },
    lastCollected: {
        type: Date,
        default: null
    }
});

export default mongoose.model('event-items', eventItemSchema);
