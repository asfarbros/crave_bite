const mongoose = require('mongoose');

const hallBookingSchema = new mongoose.Schema({
    hallId: {
        type: String,
        required: [true, 'Hall is required'],
        trim: true
    },
    date: {
        type: String,
        required: [true, 'Date is required'],
        trim: true
    },
    time: {
        type: String,
        required: [true, 'Time slot is required'],
        trim: true
    },
    eventType: {
        type: String,
        required: true,
        trim: true
    },
    guestCount: {
        type: Number,
        required: true,
        min: 1
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        trim: true
    },
    requests: {
        type: String,
        trim: true,
        default: ''
    },
    status: {
        type: String,
        enum: ['confirmed', 'cancelled'],
        default: 'confirmed'
    }
}, {
    timestamps: true
});

hallBookingSchema.index({ hallId: 1, date: 1, time: 1 });

module.exports = mongoose.model('HallBooking', hallBookingSchema);
