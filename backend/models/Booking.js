const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
    userId: {
        type: String,
        default: null
    },
    tableTypeId: {
        type: String,
        required: [true, 'Table type is required'],
        trim: true
    },
    tableName: {
        type: String,
        trim: true,
        default: ''
    },
    tableIcon: {
        type: String,
        trim: true,
        default: ''
    },
    tableNumber: {
        type: Number,
        required: [true, 'Table number is required'],
        min: 1
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
    guests: {
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

bookingSchema.index({ tableTypeId: 1, date: 1, time: 1 });
bookingSchema.index({ userId: 1 });
// Prevents two confirmed bookings from ever racing onto the same table number
bookingSchema.index(
    { tableTypeId: 1, date: 1, time: 1, tableNumber: 1 },
    { unique: true, partialFilterExpression: { status: 'confirmed' } }
);

module.exports = mongoose.model('Booking', bookingSchema);
