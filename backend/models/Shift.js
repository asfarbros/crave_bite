const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    date: {
        type: String,
        required: [true, 'Date is required'],
        trim: true
    },
    label: {
        type: String,
        trim: true,
        default: ''
    },
    startTime: {
        type: String,
        required: [true, 'Start time is required'],
        trim: true
    },
    endTime: {
        type: String,
        required: [true, 'End time is required'],
        trim: true
    },
    notes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

shiftSchema.index({ employeeId: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Shift', shiftSchema);
