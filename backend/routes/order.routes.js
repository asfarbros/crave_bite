const express = require('express');
const Food = require("../models/Food");
const {
  updateTasteProfile
} = require("../services/recommendationEngine");
const router = express.Router();
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const { protect } = require('../middleware/auth');

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
    // -----------------------------------------------------
// UPDATE AI TASTE PROFILE FROM ORDER
// -----------------------------------------------------

for (const cartItem of cartItems) {
  const food = await Food.findOne({
    name: cartItem.name
  });

  if (food) {
    await updateTasteProfile(
      userId,
      food,
      "order"
    );
  }
}
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

module.exports = router;
