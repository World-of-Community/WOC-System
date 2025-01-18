const { Schema, model } = require('mongoose');

const bumpSchema = new Schema({
    userId: {
        type: String,
        required: true
    },

    bumpedAt: {
        type: Date,
        required: true,
    },
});

module.exports = model('bump-data', bumpSchema)