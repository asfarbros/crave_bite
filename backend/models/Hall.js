const mongoose = require('mongoose');

const hallSchema = new mongoose.Schema({
    hallId: {
        type: String,
        required: [true, 'Hall ID is required'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    capacity: {
        type: Number,
        required: [true, 'Capacity is required'],
        min: [1, 'Capacity must be at least 1']
    },
    gradient: {
        type: String,
        default: ''
    },
    icon: {
        type: String,
        default: ''
    },
    features: {
        type: [String],
        default: []
    },
    count: {
        type: Number,
        required: true,
        min: [0, 'Count cannot be negative'],
        default: 1
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Hall', hallSchema);
