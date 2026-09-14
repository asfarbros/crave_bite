const mongoose = require('mongoose');

const tableSchema = new mongoose.Schema({
    typeId: {
        type: String,
        required: [true, 'Type ID is required'],
        unique: true,
        trim: true
    },
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    seats: {
        type: String,
        required: [true, 'Seats is required'],
        trim: true
    },
    icon: {
        type: String,
        default: ''
    },
    vibe: {
        type: String,
        trim: true,
        default: ''
    },
    desc: {
        type: String,
        trim: true,
        default: ''
    },
    count: {
        type: Number,
        required: [true, 'Count is required'],
        min: [0, 'Count cannot be negative'],
        default: 5
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Table', tableSchema);
