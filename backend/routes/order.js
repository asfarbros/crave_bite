const express = require('express');
const router = express.Router();
const CartItem = require('../models/CartItem');
const Order = require('../models/Order');
const Food = require('../models/Food');
const { protect, authorize } = require('../middleware/auth');
const { resolvePeriod, bucketKey, buildBuckets, widenBucketForSpan } = require('../utils/period');

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

// GET /api/order/analytics/summary?range=today|week|month|year|all&anchor=YYYY-MM-DD
// Sales analytics for a period, with the previous period for comparison (Admin only)
router.get('/analytics/summary', protect, authorize('admin'), async (req, res) => {
  try {
    let period = resolvePeriod(req.query.range, req.query.anchor);

    const orders = await Order.find({ createdAt: { $gte: period.start, $lt: period.end } }).sort({ createdAt: 1 });

    const summarize = (list) => {
      let sales = 0;
      let units = 0;
      list.forEach((order) => {
        order.items.forEach((item) => {
          sales += (item.price || 0) * (item.quantity || 0);
          units += item.quantity || 0;
        });
      });
      return {
        totalSales: Math.round(sales * 100) / 100,
        orderCount: list.length,
        itemsSold: units,
        avgOrderValue: list.length > 0 ? Math.round((sales / list.length) * 100) / 100 : 0
      };
    };

    const totals = summarize(orders);
    const totalSales = totals.totalSales;

    let previous = null;
    if (period.previous) {
      const previousOrders = await Order.find({
        createdAt: { $gte: period.previous.start, $lt: period.previous.end }
      });
      previous = { ...summarize(previousOrders), label: period.previous.label };
    }

    const first = orders[0]?.createdAt || null;
    const last = orders[orders.length - 1]?.createdAt || null;
    period = widenBucketForSpan(period, first, last);

    const bucketTotals = {};
    const itemMap = {};

    orders.forEach((order) => {
      const key = bucketKey(order.createdAt, period.bucket);
      if (!bucketTotals[key]) bucketTotals[key] = { total: 0, orders: 0 };
      bucketTotals[key].orders += 1;

      const seenInOrder = new Set();
      order.items.forEach((item) => {
        const lineTotal = (item.price || 0) * (item.quantity || 0);
        bucketTotals[key].total += lineTotal;

        if (!itemMap[item.name]) itemMap[item.name] = { name: item.name, quantity: 0, revenue: 0, orders: 0 };
        itemMap[item.name].quantity += item.quantity || 0;
        itemMap[item.name].revenue += lineTotal;
        if (!seenInOrder.has(item.name)) {
          seenInOrder.add(item.name);
          itemMap[item.name].orders += 1;
        }
      });
    });

    const series = buildBuckets(period, first, last).map((bucket) => ({
      key: bucket.key,
      label: bucket.label,
      total: Math.round((bucketTotals[bucket.key]?.total || 0) * 100) / 100,
      orders: bucketTotals[bucket.key]?.orders || 0
    }));

    const topItems = Object.values(itemMap).sort((a, b) => b.revenue - a.revenue).slice(0, 8);

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
      data: {
        period: {
          range: period.range,
          label: period.label,
          bucket: period.bucket,
          start: period.start.toISOString(),
          end: period.end.toISOString(),
          previousLabel: period.previous?.label || null
        },
        totals,
        previous,
        series,
        topItems,
        foods
      }
    });
  } catch (error) {
    console.error('Error building sales analytics:', error);
    res.status(500).json({ success: false, message: 'Server error building sales analytics' });
  }
});

module.exports = router;
