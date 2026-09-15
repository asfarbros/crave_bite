const express = require('express');
const router = express.Router();

const CartItem = require('../models/CartItem');
const Food = require('../models/Food');
const { protect } = require('../middleware/auth');

router.use(protect);


// =====================================================
// ADD ITEM TO CART
// =====================================================

router.post('/', async (req, res) => {
    try {

        const { name, quantity } = req.body;
        const userId = req.user.id;

        const parsedQuantity = Number(quantity);

        if (
            !name ||
            !Number.isInteger(parsedQuantity) ||
            parsedQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'A valid name and a positive integer quantity are required.'
            });
        }

        // Find food regardless of isAvailable.
        const food = await Food.findOne({ name });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item not found.'
            });
        }

        // -----------------------------------------
        // INVENTORY CHECK
        // -----------------------------------------

        if (
            food.stockQuantity <= 0 ||
            food.isAvailable === false
        ) {
            return res.status(400).json({
                success: false,
                message: `${food.name} is currently unavailable.`
            });
        }

        const existingItem = await CartItem.findOne({
            name,
            userId
        });

        // -----------------------------------------
        // Existing item in cart
        // -----------------------------------------

        if (existingItem) {

            const newQuantity =
                existingItem.quantity + parsedQuantity;

            if (newQuantity > food.stockQuantity) {
                return res.status(400).json({
                    success: false,
                    message:
                        `Only ${food.stockQuantity} ${food.name} available.`
                });
            }

            existingItem.quantity = newQuantity;

            // Always get latest price/image
            // from Food collection.
            existingItem.price = food.price;
            existingItem.imageUrl = food.imageUrl;

            await existingItem.save();

            return res.status(200).json({
                success: true,
                item: existingItem,
                updated: true
            });
        }

        // -----------------------------------------
        // New cart item
        // -----------------------------------------

        if (parsedQuantity > food.stockQuantity) {
            return res.status(400).json({
                success: false,
                message:
                    `Only ${food.stockQuantity} ${food.name} available.`
            });
        }

        const newItem = new CartItem({
            name: food.name,
            price: food.price,
            quantity: parsedQuantity,
            imageUrl: food.imageUrl,
            userId
        });

        await newItem.save();

        res.status(201).json({
            success: true,
            item: newItem
        });

    } catch (error) {

        console.error('Add to cart error:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// =====================================================
// GET CART
// =====================================================

router.get('/', async (req, res) => {
    try {

        const items = await CartItem.find({
            userId: req.user.id
        });

        res.json({
            success: true,
            items
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// =====================================================
// UPDATE CART QUANTITY
// =====================================================

router.put('/:id', async (req, res) => {
    try {

        const parsedQuantity =
            Number(req.body.quantity);

        if (
            !Number.isInteger(parsedQuantity) ||
            parsedQuantity <= 0
        ) {
            return res.status(400).json({
                success: false,
                message:
                    'quantity must be a positive integer.'
            });
        }

        const cartItem = await CartItem.findOne({
            _id: req.params.id,
            userId: req.user.id
        });

        if (!cartItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        // -----------------------------------------
        // Check latest inventory
        // -----------------------------------------

        const food = await Food.findOne({
            name: cartItem.name
        });

        if (!food) {
            return res.status(404).json({
                success: false,
                message: 'Food item no longer exists.'
            });
        }

        if (
            food.stockQuantity <= 0 ||
            food.isAvailable === false
        ) {
            return res.status(400).json({
                success: false,
                message:
                    `${food.name} is no longer available.`
            });
        }

        if (parsedQuantity > food.stockQuantity) {
            return res.status(400).json({
                success: false,
                message:
                    `Only ${food.stockQuantity} ${food.name} available.`
            });
        }

        cartItem.quantity = parsedQuantity;

        // Update latest price
        cartItem.price = food.price;

        await cartItem.save();

        res.json({
            success: true,
            item: cartItem
        });

    } catch (error) {

        console.error('Update cart error:', error);

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


// =====================================================
// REMOVE ITEM FROM CART
// =====================================================

router.delete('/:id', async (req, res) => {
    try {

        const deletedItem =
            await CartItem.findOneAndDelete({
                _id: req.params.id,
                userId: req.user.id
            });

        if (!deletedItem) {
            return res.status(404).json({
                success: false,
                message: 'Cart item not found'
            });
        }

        res.json({
            success: true,
            message: 'Item removed from cart'
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });
    }
});


module.exports = router;