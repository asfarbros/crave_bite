const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');

// POST /api/order/place - Create an order from the user's cart
router.post('/place', protect, async (req, res) => {
  try {
    const userId = req.user.id;

    const cartItems = await CartItem.find({ userId });
    if (!cartItems.length) {
      return res.status(400).json({ success: false, message: "Cart is empty." });
    }

    const newOrder = new Order({
      userId,
      items: cartItems.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.quantity
      }))
    });

    await newOrder.save();
    await CartItem.deleteMany({ userId });

    res.status(201).json({ success: true, message: "Order placed successfully." });
  } catch (error) {
    console.error("Error placing order:", error);
    res.status(500).json({ success: false, message: "Something went wrong. Try again." });
  }
});

// GET /api/order/myorders - Get the current user's orders
router.get('/myorders', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const orders = await Order.find({ userId }).sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch orders." });
  }
});

// GET /api/order/all - Get all orders (Admin only)
router.get('/all', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    console.error("Error fetching all orders:", error);
    res.status(500).json({ success: false, message: "Failed to fetch all orders." });
  }
});

module.exports = router;
