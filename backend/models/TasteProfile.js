const mongoose = require('mongoose');

const tasteProfileSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    spiceLevel: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    cheesePreference: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    healthyPreference: {
        type: Number,
        default: 0,
        min: 0,
        max: 10
    },
    cuisines: {
        type: Map,
        of: Number,
        default: {}
    },
    proteins: {
        type: Map,
        of: Number,
        default: {}
    },
    categories: {
        type: Map,
        of: Number,
        default: {}
    },
    averagePrice: {
        type: Number,
        default: 0
    },
    totalInteractions: {
        type: Number,
        default: 0
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('TasteProfile', tasteProfileSchema);
