const express = require('express');
const router = express.Router();

const CartItem = require('../models/CartItem');
const Food = require('../models/Food');
const { protect } = require('../middleware/auth');

router.use(protect);

// Add item to cart — price is always taken from the Food collection, never trusted from the client
router.post('/', async (req, res) => {
  try {
    const { name, quantity } = req.body;
    const userId = req.user.id;

    const parsedQuantity = Number(quantity);
    if (!name || !Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'A valid name and a positive integer quantity are required.' });
    }

    const food = await Food.findOne({ name, isAvailable: true });
    if (!food) {
      return res.status(404).json({ success: false, message: 'Food item not found or unavailable.' });
    }

    const existingItem = await CartItem.findOne({ name, userId });

    if (existingItem) {
      // Update quantity instead of adding duplicate
      existingItem.quantity += parsedQuantity;
      existingItem.price = food.price;
      existingItem.imageUrl = food.imageUrl;
      await existingItem.save();
      return res.status(200).json({ success: true, item: existingItem, updated: true });
    }

    const newItem = new CartItem({ name, price: food.price, quantity: parsedQuantity, imageUrl: food.imageUrl, userId });
    await newItem.save();
    res.status(201).json({ success: true, item: newItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get all cart items for the authenticated user
router.get('/', async (req, res) => {
  try {
    const items = await CartItem.find({ userId: req.user.id });
    res.json({ success: true, items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Update quantity of a cart item (must belong to the authenticated user)
router.put('/:id', async (req, res) => {
  try {
    const parsedQuantity = Number(req.body.quantity);
    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      return res.status(400).json({ success: false, message: 'quantity must be a positive integer.' });
    }

    const updatedItem = await CartItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { quantity: parsedQuantity },
      { new: true }
    );

    if (!updatedItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    res.json({ success: true, item: updatedItem });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Remove a cart item entirely (must belong to the authenticated user)
router.delete('/:id', async (req, res) => {
  try {
    const deletedItem = await CartItem.findOneAndDelete({ _id: req.params.id, userId: req.user.id });

    if (!deletedItem) {
      return res.status(404).json({ success: false, message: 'Cart item not found' });
    }

    res.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
