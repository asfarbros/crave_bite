const mongoose = require('mongoose');

const performanceNoteSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    note: {
        type: String,
        trim: true,
        required: [true, 'Note is required']
    },
    rating: {
        type: Number,
        min: 1,
        max: 5
    },
    createdBy: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('PerformanceNote', performanceNoteSchema);
