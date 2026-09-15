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

// =====================================================
// GET ALL FOODS
// =====================================================

router.get('/', async (req, res) => {
    try {
        // Return ALL foods.
        // The frontend will display unavailable items
        // instead of hiding them.
        const foods = await Food.find({}).sort({ createdAt: 1 });

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


// =====================================================
// ADD NEW FOOD - ADMIN ONLY
// =====================================================

router.post('/', protect, authorize('admin'), async (req, res) => {
    try {
        const {
            name,
            description,
            price,
            category,
            imageBase64,
            stockQuantity
        } = req.body;

        if (!name || !price || !category || !imageBase64) {
            return res.status(400).json({
                success: false,
                message: 'Please provide all required fields including imageBase64'
            });
        }

        // Upload image to Cloudinary
        const uploadResponse = await cloudinary.uploader.upload(
            imageBase64,
            {
                folder: 'cravebite_foods'
            }
        );

        const stock =
            stockQuantity !== undefined
                ? Number(stockQuantity)
                : 10;

        if (!Number.isInteger(stock) || stock < 0) {
            return res.status(400).json({
                success: false,
                message: 'Stock quantity must be a non-negative integer.'
            });
        }

        const newFood = new Food({
            name,
            description,
            price,
            category,

            imageUrl: uploadResponse.secure_url,
            imagePublicId: uploadResponse.public_id,

            stockQuantity: stock,
            isAvailable: stock > 0
        });

        await newFood.save();

        res.status(201).json({
            success: true,
            data: newFood
        });

    } catch (error) {
        console.error('Error adding food:', error);

        res.status(500).json({
            success: false,
            message: 'Server error adding food item'
        });
    }
});


// =====================================================
// UPDATE FOOD - ADMIN ONLY
// =====================================================

router.put('/:id', protect, authorize('admin'), async (req, res) => {
    try {
        let food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food not found'
            });
        }

        const {
            name,
            description,
            price,
            category,
            imageBase64,
            isAvailable,
            stockQuantity
        } = req.body;

        const updateData = {
            name,
            description,
            price,
            category
        };

        // -----------------------------------------
        // Inventory update
        // -----------------------------------------

        if (stockQuantity !== undefined) {
            const stock = Number(stockQuantity);

            if (!Number.isInteger(stock) || stock < 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Stock quantity must be a non-negative integer.'
                });
            }

            updateData.stockQuantity = stock;

            // Automatically determine availability
            updateData.isAvailable = stock > 0;
        }

        // Only use manually supplied availability
        // if stockQuantity wasn't changed.
        if (
            stockQuantity === undefined &&
            isAvailable !== undefined
        ) {
            updateData.isAvailable = isAvailable;
        }

        // -----------------------------------------
        // Image update
        // -----------------------------------------

        if (imageBase64) {

            if (food.imagePublicId) {
                await cloudinary.uploader.destroy(
                    food.imagePublicId
                );
            }

            const uploadResponse =
                await cloudinary.uploader.upload(
                    imageBase64,
                    {
                        folder: 'cravebite_foods'
                    }
                );

            updateData.imageUrl =
                uploadResponse.secure_url;

            updateData.imagePublicId =
                uploadResponse.public_id;
        }

        food = await Food.findByIdAndUpdate(
            req.params.id,
            updateData,
            {
                new: true,
                runValidators: true
            }
        );

        res.status(200).json({
            success: true,
            data: food
        });

    } catch (error) {
        console.error('Error updating food:', error);

        res.status(500).json({
            success: false,
            message: 'Server error updating food item'
        });
    }
});


// =====================================================
// DELETE FOOD - ADMIN ONLY
// =====================================================

router.delete('/:id', protect, authorize('admin'), async (req, res) => {
    try {

        const food = await Food.findById(req.params.id);

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food not found'
            });
        }

        if (food.imagePublicId) {
            await cloudinary.uploader.destroy(
                food.imagePublicId
            );
        }

        await food.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Food item deleted successfully'
        });

    } catch (error) {
        console.error('Error deleting food:', error);

        res.status(500).json({
            success: false,
            message: 'Server error deleting food item'
        });
    }
});


module.exports = router;