const mongoose = require('mongoose');

const coinSchema = new mongoose.Schema({
    userId: String,
    coins: { type: Number, default: 0 },
});

module.exports = mongoose.model('Coin', coinSchema);
