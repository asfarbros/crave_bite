const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { protect, authorize } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
  api_key: process.env.CLOUDINARY_API_KEY, 
  api_secret: process.env.CLOUDINARY_API_SECRET 
});

// GET all foods
router.get('/', async (req, res) => {
    try {
        // Admins can see all, users see only available
        let query = { isAvailable: true };
        
        // If query param 'all' is passed and user is admin (we can check token if provided)
        if (req.query.all === 'true') {
            query = {}; // fetch all
        }

        const foods = await Food.find(query);
        res.status(200).json({
            success: true,
            count: foods.length,
            data: foods
        });
    } catch (error) {
        console.error('Error fetching foods:', error);
        res.status(500).json({
            success: false,
            message: 'Server Error'
        });
    }
});

// POST add a new food item (Admin only)
router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const { name, description, price, category, imageBase64 } = req.body;

        if (!name || !price || !category || !imageBase64) {
            return res.status(400).json({ success: false, message: 'Please provide all required fields including imageBase64' });
        }

        // Upload to cloudinary
        const uploadResponse = await cloudinary.uploader.upload(imageBase64, {
            folder: 'cravebite_foods'
        });

        const newFood = new Food({
            name,
            description,
            price,
            category,
            imageUrl: uploadResponse.secure_url,
            imagePublicId: uploadResponse.public_id
        });

        await newFood.save();
        res.status(201).json({ success: true, data: newFood });
    } catch (error) {
        console.error('Error adding food:', error);
        res.status(500).json({ success: false, message: 'Server error adding food item' });
    }
});

// PUT update a food item (Admin only)
router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        let food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food not found' });
        }

        const { name, description, price, category, imageBase64, isAvailable } = req.body;
        
        const updateData = { name, description, price, category };
        if (isAvailable !== undefined) updateData.isAvailable = isAvailable;

        if (imageBase64) {
            // Delete old image
            if (food.imagePublicId) {
                await cloudinary.uploader.destroy(food.imagePublicId);
            }
            // Upload new image
            const uploadResponse = await cloudinary.uploader.upload(imageBase64, { folder: 'cravebite_foods' });
            updateData.imageUrl = uploadResponse.secure_url;
            updateData.imagePublicId = uploadResponse.public_id;
        }

        food = await Food.findByIdAndUpdate(req.params.id, updateData, { new: true, runValidators: true });
        res.status(200).json({ success: true, data: food });
    } catch (error) {
        console.error('Error updating food:', error);
        res.status(500).json({ success: false, message: 'Server error updating food item' });
    }
});

// DELETE a food item (Admin only)
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) {
            return res.status(404).json({ success: false, message: 'Food not found' });
        }

        if (food.imagePublicId) {
            await cloudinary.uploader.destroy(food.imagePublicId);
        }

        await food.deleteOne();
        res.status(200).json({ success: true, message: 'Food item deleted successfully' });
    } catch (error) {
        console.error('Error deleting food:', error);
        res.status(500).json({ success: false, message: 'Server error deleting food item' });
    }
});

module.exports = router;
