const express = require('express');
const router = express.Router();

const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const Food = require('../models/Food');

const { protect } = require('../middleware/auth');


// =====================================================
// PLACE ORDER
// =====================================================

router.post('/place', protect, async (req, res) => {

    try {

        const userId = req.user.id;

        // -----------------------------------------
        // Get user's cart
        // -----------------------------------------

        const cartItems = await CartItem.find({
            userId
        });

        if (!cartItems.length) {
            return res.status(400).json({
                success: false,
                message: 'Cart is empty.'
            });
        }

        // -----------------------------------------
        // Validate inventory first
        // -----------------------------------------

        for (const item of cartItems) {

            const food = await Food.findOne({
                name: item.name
            });

            if (!food) {
                return res.status(400).json({
                    success: false,
                    message:
                        `${item.name} is no longer available.`
                });
            }

            if (
                food.stockQuantity < item.quantity ||
                food.isAvailable === false
            ) {

                return res.status(400).json({
                    success: false,
                    message:
                        `${item.name} has only ${food.stockQuantity} item(s) left. Please update your cart.`
                });
            }
        }


        // -----------------------------------------
        // Reduce inventory
        //
        // Atomic update:
        // stock can NEVER go below zero.
        // -----------------------------------------

        const updatedFoods = [];

        for (const item of cartItems) {

            const updatedFood =
                await Food.findOneAndUpdate(
                    {
                        name: item.name,

                        // IMPORTANT:
                        // Only update if enough stock still exists.
                        stockQuantity: {
                            $gte: item.quantity
                        },

                        isAvailable: true
                    },
                    {
                        $inc: {
                            stockQuantity:
                                -item.quantity
                        }
                    },
                    {
                        new: true
                    }
                );

            if (!updatedFood) {

                // ---------------------------------
                // Roll back previously updated items
                // ---------------------------------

                for (const previousFood of updatedFoods) {

                    const previousItem =
                        cartItems.find(
                            cartItem =>
                                cartItem.name ===
                                previousFood.name
                        );

                    if (previousItem) {

                        await Food.findOneAndUpdate(
                            {
                                name:
                                    previousFood.name
                            },
                            {
                                $inc: {
                                    stockQuantity:
                                        previousItem.quantity
                                },
                                $set: {
                                    isAvailable: true
                                }
                            }
                        );
                    }
                }

                return res.status(400).json({
                    success: false,
                    message:
                        `Sorry, ${item.name} is no longer available in the requested quantity.`
                });
            }

            // ---------------------------------
            // Automatically mark unavailable
            // ---------------------------------

            if (updatedFood.stockQuantity === 0) {

                updatedFood.isAvailable = false;

                await updatedFood.save();
            }

            updatedFoods.push(updatedFood);
        }


        // -----------------------------------------
        // Create order
        // -----------------------------------------

        const newOrder = new Order({

            userId,

            items: cartItems.map(item => ({
                name: item.name,
                price: item.price,
                quantity: item.quantity
            }))
        });

        await newOrder.save();


        // -----------------------------------------
        // Empty cart
        // -----------------------------------------

        await CartItem.deleteMany({
            userId
        });


        res.status(201).json({
            success: true,
            message: 'Order placed successfully.',
            order: newOrder
        });


    } catch (error) {

        console.error(
            'Error placing order:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Something went wrong. Try again.'
        });
    }
});


// =====================================================
// GET MY ORDERS
// =====================================================

router.get('/myorders', protect, async (req, res) => {

    try {

        const userId = req.user.id;

        const orders =
            await Order.find({
                userId
            }).sort({
                createdAt: -1
            });

        res.json({
            success: true,
            orders
        });

    } catch (error) {

        console.error(
            'Error fetching orders:',
            error
        );

        res.status(500).json({
            success: false,
            message:
                'Failed to fetch orders.'
        });
    }
});


module.exports = router;