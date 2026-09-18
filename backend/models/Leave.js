const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    fromDate: {
        type: String,
        required: [true, 'From date is required'],
        trim: true
    },
    toDate: {
        type: String,
        required: [true, 'To date is required'],
        trim: true
    },
    reason: {
        type: String,
        trim: true,
        required: [true, 'Reason is required']
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    reviewedBy: {
        type: String,
        trim: true,
        default: ''
    },
    reviewNotes: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Leave', leaveSchema);
