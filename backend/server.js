const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const paymentRoutes = require('./routes/payment');
const cartRoutes = require('./routes/cart');
const orderRoutes = require('./routes/order');
const foodRoutes = require('./routes/food');
const chatbotRoutes = require('./routes/chatbot');
const recommendationsRoutes = require('./routes/recommendations');
const tasteProfileRoutes = require('./routes/tasteProfile');
const bookingRoutes = require('./routes/booking');
const hallBookingRoutes = require('./routes/hallBooking');
const { protect } = require('./middleware/auth');

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:5173',       // React dev server
    'http://127.0.0.1:5173',       // React dev server (IP)
    'http://localhost:5174',       // React dev server (alternative port)
    'http://127.0.0.1:5174',       // React dev server (alternative port)
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    'https://crave-bite-seven.vercel.app',
    'file://',                     // HTML files
    'null'                         // HTML files (alternative)
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Rate limiting — a lenient general limit for normal browsing/API use,
// plus a strict limit scoped to auth endpoints where brute-force protection matters.
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // per IP
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health'
});
app.use(generalLimiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // per IP, covers signup/login/forgot-password attempts
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' }
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/cart', cartRoutes); 
app.use('/api/order', orderRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/taste-profile', tasteProfileRoutes);
app.use('/api/booking', bookingRoutes);
app.use('/api/hall-booking', hallBookingRoutes);


// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Server is running',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI , {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
  socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
})
.then(() => {
  console.log('✅ Connected to MongoDB');
  startServer();
})
.catch((err) => {
  console.error('❌ MongoDB connection error:', err.message);
  console.error('⚠️  Starting server without MongoDB — database-dependent routes will return errors until MONGODB_URI is fixed and the server is restarted.');
  startServer();
});

function startServer() {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/api/health`);
  });
}

module.exports = app; 