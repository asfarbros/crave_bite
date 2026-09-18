const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    role: {
        type: String,
        required: [true, 'Role is required'],
        trim: true
    },
    phone: {
        type: String,
        trim: true,
        default: ''
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
        default: ''
    },
    avatar: {
        type: String,
        default: '🧑'
    },
    joinDate: {
        type: String,
        default: () => new Date().toISOString().split('T')[0]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    salaryType: {
        type: String,
        enum: ['monthly', 'daily', 'hourly'],
        default: 'monthly'
    },
    baseSalary: {
        type: Number,
        default: 0,
        min: 0
    },
    documents: [{
        title: { type: String, trim: true, required: true },
        url: { type: String, required: true },
        publicId: { type: String, required: true },
        uploadedAt: { type: Date, default: Date.now }
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Employee', employeeSchema);
