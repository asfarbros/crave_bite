const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');

const CartItem = require('../models/CartItem');


// Add item to cart
router.post('/', async (req, res) => {
  try {
    const { name, price, quantity,userId } = req.body;
    const existingItem = await CartItem.findOne({ name, userId });

    if (existingItem) {
      // Update quantity instead of adding duplicate
      existingItem.quantity += quantity;
      await existingItem.save();
      return res.status(200).json({ success: true, item: existingItem, updated: true });
    }
    console.log('Received userId:', userId);

    const newItem = new CartItem({ name, price, quantity,userId });
    await newItem.save();
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all cart items
router.get('/', async (req, res) => {
  try {
    const { userId } = req.query;  // Get userId from query param
    const items = await CartItem.find({ userId });  // Filter by userId
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update quantity of a cart item
router.put('/:id', async (req, res) => {
  try {
    const { quantity } = req.body;
    const updatedItem = await CartItem.findByIdAndUpdate(
      req.params.id,
      { quantity },
      { new: true }
    );
    res.json({ success: true, item: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});


module.exports = router;
