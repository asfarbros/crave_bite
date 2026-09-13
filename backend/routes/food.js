const express = require('express');
const router = express.Router();
const Food = require('../models/Food');
const { protect, authorize } = require('../middleware/auth');
const cloudinary = require('cloudinary').v2;
const redis = require('../config/redis');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const CACHE_TTL_SECONDS = 60;

async function invalidateFoodCache() {
    if (!redis) return;
    try {
        await redis.del('foods:all', 'foods:public');
    } catch (error) {
        console.error('Redis invalidation error (non-fatal):', error.message);
    }
}

// GET all foods
router.get('/', async (req, res) => {
    const isAdminView = req.query.all === 'true';
    const cacheKey = isAdminView ? 'foods:all' : 'foods:public';

    if (redis) {
        try {
            const cached = await redis.get(cacheKey);
            if (cached) {
                res.set('X-Cache', 'HIT');
                // @upstash/redis auto-deserializes JSON values it stored, so `cached` is already an object.
                return res.status(200).json(cached);
            }
        } catch (error) {
            console.error('Redis read error (falling back to DB):', error.message);
        }
    }

    try {
        // Admins can see all, users see only available
        const query = isAdminView ? {} : { isAvailable: true };

        const foods = await Food.find(query);
        const payload = {
            success: true,
            count: foods.length,
            data: foods
        };

        res.set('X-Cache', 'MISS');
        res.status(200).json(payload);

        if (redis) {
            try {
                await redis.set(cacheKey, payload, { ex: CACHE_TTL_SECONDS });
            } catch (error) {
                console.error('Redis write error (non-fatal):', error.message);
            }
        }
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
        await invalidateFoodCache();
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
        await invalidateFoodCache();
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
        await invalidateFoodCache();
        res.status(200).json({ success: true, message: 'Food item deleted successfully' });
    } catch (error) {
        console.error('Error deleting food:', error);
        res.status(500).json({ success: false, message: 'Server error deleting food item' });
    }
});

module.exports = router;
