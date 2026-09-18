const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    employeeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    month: {
        type: String,
        required: [true, 'Month is required'],
        trim: true
    },
    baseSalary: {
        type: Number,
        required: true,
        min: 0
    },
    presentDays: {
        type: Number,
        default: 0
    },
    absentDays: {
        type: Number,
        default: 0
    },
    leaveDays: {
        type: Number,
        default: 0
    },
    bonus: {
        type: Number,
        default: 0
    },
    deductions: {
        type: Number,
        default: 0
    },
    netPay: {
        type: Number,
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'paid'],
        default: 'pending'
    },
    paidOn: {
        type: String,
        trim: true,
        default: ''
    }
}, {
    timestamps: true
});

payrollSchema.index({ employeeId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
