const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const Food = require('../models/Food');
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

// GET /api/order/analytics/summary?month=YYYY-MM - Sales analytics for a month (Admin only)
router.get('/analytics/summary', protect, authorize('admin'), async (req, res) => {
  try {
    const month = req.query.month || new Date().toISOString().slice(0, 7);
    const [year, mon] = month.split('-').map(Number);
    if (!year || !mon) {
      return res.status(400).json({ success: false, message: 'month must be in YYYY-MM format' });
    }

    const start = new Date(Date.UTC(year, mon - 1, 1));
    const end = new Date(Date.UTC(year, mon, 1));

    const orders = await Order.find({ createdAt: { $gte: start, $lt: end } }).sort({ createdAt: 1 });

    let totalSales = 0;
    let itemsSold = 0;
    const dailyMap = {};
    const itemMap = {};

    orders.forEach((order) => {
      const day = order.createdAt.toISOString().split('T')[0];
      if (!dailyMap[day]) dailyMap[day] = { date: day, total: 0, orders: 0 };
      dailyMap[day].orders += 1;

      const seenInOrder = new Set();
      order.items.forEach((item) => {
        const lineTotal = (item.price || 0) * (item.quantity || 0);
        totalSales += lineTotal;
        itemsSold += item.quantity || 0;
        dailyMap[day].total += lineTotal;

        if (!itemMap[item.name]) itemMap[item.name] = { name: item.name, quantity: 0, revenue: 0, orders: 0 };
        itemMap[item.name].quantity += item.quantity || 0;
        itemMap[item.name].revenue += lineTotal;
        if (!seenInOrder.has(item.name)) {
          seenInOrder.add(item.name);
          itemMap[item.name].orders += 1;
        }
      });
    });

    const daily = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));
    const topItems = Object.values(itemMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8);
    const orderCount = orders.length;
    const avgOrderValue = orderCount > 0 ? Math.round((totalSales / orderCount) * 100) / 100 : 0;

    // Per-dish breakdown: every dish on the menu, including ones that sold nothing,
    // plus any sold dish that has since been removed from the menu.
    const share = (revenue) => (totalSales > 0 ? Math.round((revenue / totalSales) * 1000) / 10 : 0);
    const catalog = await Food.find().sort({ name: 1 });
    const matchedNames = new Set();

    const foods = catalog.map((food) => {
      const stats = itemMap[food.name];
      if (stats) matchedNames.add(food.name);
      return {
        name: food.name,
        category: food.category,
        imageUrl: food.imageUrl,
        price: food.price,
        isAvailable: food.isAvailable,
        onMenu: true,
        quantity: stats?.quantity || 0,
        revenue: stats?.revenue || 0,
        orders: stats?.orders || 0,
        revenueShare: share(stats?.revenue || 0)
      };
    });

    Object.values(itemMap).forEach((stats) => {
      if (matchedNames.has(stats.name)) return;
      foods.push({
        name: stats.name,
        category: '',
        imageUrl: '',
        price: null,
        isAvailable: false,
        onMenu: false,
        quantity: stats.quantity,
        revenue: stats.revenue,
        orders: stats.orders,
        revenueShare: share(stats.revenue)
      });
    });

    foods.sort((a, b) => b.revenue - a.revenue);

    res.status(200).json({
      success: true,
      data: { month, totalSales, orderCount, avgOrderValue, itemsSold, daily, topItems, foods }
    });
  } catch (error) {
    console.error('Error building sales analytics:', error);
    res.status(500).json({ success: false, message: 'Server error building sales analytics' });
  }
});

module.exports = router;
