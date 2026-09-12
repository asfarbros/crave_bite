const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    price: {
        type: Number,
        required: [true, 'Price is required'],
        min: [0, 'Price cannot be negative']
    },
    category: {
        type: String,
        required: [true, 'Category is required'],
        trim: true
    },
    imageUrl: {
        type: String,
        required: [true, 'Image is required']
    },
    imagePublicId: {
        type: String,
        required: [true, 'Image public ID is required']
    },
    isAvailable: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

foodSchema.index({ category: 1 });

module.exports = mongoose.model('Food', foodSchema);
