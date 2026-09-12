const express = require('express');
const router = express.Router();
const Food = require('../models/Food');

// GET all foods
router.get('/', async (req, res) => {
    try {
        const foods = await Food.find({ isAvailable: true });
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

module.exports = router;
